"""
Аутентификация: регистрация, вход, выход, профиль, история генераций.
"""
import json
import os
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

SUBSCRIPTION_LABELS = {
    "free": "Бесплатный",
    "starter": "Стартер",
    "pro": "Профессионал",
    "business": "Бизнес",
}

TYPE_LABELS = {
    "music": "Музыка",
    "jingle": "Джингл",
    "video": "Видео",
    "photo": "Фото",
    "text": "Текст",
}


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def q(table: str) -> str:
    return f'"{SCHEMA}".{table}'


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hmac.new(salt.encode(), password.encode(), hashlib.sha256).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, hashed = password_hash.split(":", 1)
        expected = hmac.new(salt.encode(), password.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, hashed)
    except Exception:
        return False


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization, X-Session-Id",
    }


def get_token_from_event(event: dict) -> str:
    auth_header = event.get("headers", {}).get("X-Authorization", "")
    return auth_header.replace("Bearer ", "").strip()


def get_user_by_token(cur, token: str):
    cur.execute(
        f"SELECT u.id, u.email, u.name, u.role, u.status, u.subscription, u.subscription_expires_at, u.created_at "
        f"FROM {q('user_sessions')} s JOIN {q('users')} u ON s.user_id = u.id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    """Регистрация, вход, выход, профиль, история генераций пользователя"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": "", "isBase64Encoded": False}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    print(f"[DEBUG] method={method} path={path} body_raw={event.get('body', '')[:200]}")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_db()
    cur = conn.cursor()

    try:
        # POST /auth/login
        if method == "POST" and "/login" in path:
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")

            cur.execute(f"SELECT id, email, password_hash, name, role, status FROM {q('users')} WHERE email = %s", (email,))
            row = cur.fetchone()

            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Неверный email или пароль"}), "isBase64Encoded": False}

            user_id, email_db, pw_hash, name, role, status = row

            if status == "blocked":
                return {"statusCode": 403, "headers": cors_headers(), "body": json.dumps({"error": "Аккаунт заблокирован"}), "isBase64Encoded": False}

            if not verify_password(password, pw_hash):
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Неверный email или пароль"}), "isBase64Encoded": False}

            token = secrets.token_urlsafe(48)
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(
                f"INSERT INTO {q('user_sessions')} (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, token, expires)
            )
            cur.execute(f"UPDATE {q('users')} SET last_login_at = NOW() WHERE id = %s", (user_id,))
            cur.execute(
                f"INSERT INTO {q('user_activity_log')} (user_id, action, details) VALUES (%s, %s, %s)",
                (user_id, "login", "Успешный вход")
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"token": token, "user": {"id": user_id, "email": email_db, "name": name, "role": role}}),
                "isBase64Encoded": False,
            }

        # POST /auth/register
        elif method == "POST" and "/register" in path:
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            name = body.get("name", "")

            if not email or not password:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Email и пароль обязательны"}), "isBase64Encoded": False}

            cur.execute(f"SELECT id FROM {q('users')} WHERE email = %s", (email,))
            if cur.fetchone():
                return {"statusCode": 409, "headers": cors_headers(), "body": json.dumps({"error": "Пользователь уже существует"}), "isBase64Encoded": False}

            pw_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {q('users')} (email, password_hash, name, role, status) VALUES (%s, %s, %s, 'user', 'active') RETURNING id",
                (email, pw_hash, name)
            )
            user_id = cur.fetchone()[0]

            token = secrets.token_urlsafe(48)
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(
                f"INSERT INTO {q('user_sessions')} (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, token, expires)
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"token": token, "user": {"id": user_id, "email": email, "name": name, "role": "user"}}),
                "isBase64Encoded": False,
            }

        # GET /auth/me
        elif method == "GET" and "/me" in path:
            token = get_token_from_event(event)
            if not token:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Токен не передан"}), "isBase64Encoded": False}

            row = get_user_by_token(cur, token)
            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid, email, name, role, status, sub, sub_expires, created = row
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"id": uid, "email": email, "name": name, "role": role, "status": status, "subscription": sub, "created_at": str(created)}),
                "isBase64Encoded": False,
            }

        # POST /auth/logout
        elif method == "POST" and "/logout" in path:
            token = get_token_from_event(event)
            if token:
                cur.execute(f"UPDATE {q('user_sessions')} SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True}), "isBase64Encoded": False}

        # GET /auth/profile — полный профиль с подпиской
        elif method == "GET" and "/profile" in path:
            token = get_token_from_event(event)
            if not token:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"}), "isBase64Encoded": False}

            row = get_user_by_token(cur, token)
            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid, email, name, role, status, sub, sub_expires, created = row

            # Считаем количество генераций по типам
            cur.execute(
                f"SELECT type, COUNT(*) FROM {q('user_generations')} WHERE user_id = %s GROUP BY type",
                (uid,)
            )
            counts = {r[0]: r[1] for r in cur.fetchall()}

            sub_label = SUBSCRIPTION_LABELS.get(sub or "free", sub or "free")

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({
                    "id": uid,
                    "email": email,
                    "name": name or "",
                    "role": role,
                    "subscription": sub or "free",
                    "subscription_label": sub_label,
                    "subscription_expires_at": str(sub_expires) if sub_expires else None,
                    "created_at": str(created),
                    "generation_counts": counts,
                }),
                "isBase64Encoded": False,
            }

        # PUT /auth/profile — обновление имени и email
        elif method == "PUT" and "/profile" in path:
            token = get_token_from_event(event)
            if not token:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"}), "isBase64Encoded": False}

            row = get_user_by_token(cur, token)
            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid = row[0]
            new_name = body.get("name", "").strip()
            new_email = body.get("email", "").strip().lower()

            if not new_email:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Email обязателен"}), "isBase64Encoded": False}

            # Проверяем, не занят ли email другим пользователем
            cur.execute(f"SELECT id FROM {q('users')} WHERE email = %s AND id != %s", (new_email, uid))
            if cur.fetchone():
                return {"statusCode": 409, "headers": cors_headers(), "body": json.dumps({"error": "Email уже используется"}), "isBase64Encoded": False}

            cur.execute(
                f"UPDATE {q('users')} SET name = %s, email = %s, updated_at = NOW() WHERE id = %s",
                (new_name, new_email, uid)
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True, "name": new_name, "email": new_email}),
                "isBase64Encoded": False,
            }

        # PUT /auth/password — смена пароля
        elif method == "PUT" and "/password" in path:
            token = get_token_from_event(event)
            if not token:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"}), "isBase64Encoded": False}

            row = get_user_by_token(cur, token)
            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid = row[0]
            current_password = body.get("current_password", "")
            new_password = body.get("new_password", "")

            if not current_password or not new_password:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Укажите текущий и новый пароль"}), "isBase64Encoded": False}

            if len(new_password) < 6:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Пароль должен быть не менее 6 символов"}), "isBase64Encoded": False}

            cur.execute(f"SELECT password_hash FROM {q('users')} WHERE id = %s", (uid,))
            pw_hash = cur.fetchone()[0]

            if not verify_password(current_password, pw_hash):
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Неверный текущий пароль"}), "isBase64Encoded": False}

            new_hash = hash_password(new_password)
            cur.execute(f"UPDATE {q('users')} SET password_hash = %s, updated_at = NOW() WHERE id = %s", (new_hash, uid))
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True}),
                "isBase64Encoded": False,
            }

        # GET /auth/history — история генераций
        elif method == "GET" and "/history" in path:
            token = get_token_from_event(event)
            if not token:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"}), "isBase64Encoded": False}

            row = get_user_by_token(cur, token)
            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid = row[0]

            params = event.get("queryStringParameters") or {}
            filter_type = params.get("type", "")
            limit = min(int(params.get("limit", 50)), 100)
            offset = int(params.get("offset", 0))

            if filter_type and filter_type in TYPE_LABELS:
                cur.execute(
                    f"SELECT id, type, title, prompt, result_url, preview_url, duration, status, created_at "
                    f"FROM {q('user_generations')} WHERE user_id = %s AND type = %s "
                    f"ORDER BY created_at DESC LIMIT %s OFFSET %s",
                    (uid, filter_type, limit, offset)
                )
            else:
                cur.execute(
                    f"SELECT id, type, title, prompt, result_url, preview_url, duration, status, created_at "
                    f"FROM {q('user_generations')} WHERE user_id = %s "
                    f"ORDER BY created_at DESC LIMIT %s OFFSET %s",
                    (uid, limit, offset)
                )

            rows = cur.fetchall()
            items = []
            for r in rows:
                items.append({
                    "id": r[0],
                    "type": r[1],
                    "type_label": TYPE_LABELS.get(r[1], r[1]),
                    "title": r[2] or "",
                    "prompt": r[3] or "",
                    "result_url": r[4] or "",
                    "preview_url": r[5] or "",
                    "duration": r[6],
                    "status": r[7],
                    "created_at": str(r[8]),
                })

            cur.execute(f"SELECT COUNT(*) FROM {q('user_generations')} WHERE user_id = %s", (uid,))
            total = cur.fetchone()[0]

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"items": items, "total": total}),
                "isBase64Encoded": False,
            }

        # POST /auth/generation — сохранить запись в историю генераций
        elif method == "POST" and "/generation" in path:
            token = get_token_from_event(event)
            if not token:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"}), "isBase64Encoded": False}

            row = get_user_by_token(cur, token)
            if not row:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid = row[0]
            gen_type = body.get("type", "")
            if gen_type not in ("music", "jingle", "video", "photo", "text"):
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Неверный тип"}), "isBase64Encoded": False}

            title = body.get("title", "") or ""
            prompt_text = body.get("prompt", "") or ""
            result_url = body.get("result_url", "") or ""
            preview_url = body.get("preview_url", "") or ""
            duration = body.get("duration")

            cur.execute(
                f"INSERT INTO {q('user_generations')} (user_id, type, title, prompt, result_url, preview_url, duration, status) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, 'done') RETURNING id",
                (uid, gen_type, title, prompt_text, result_url, preview_url, duration)
            )
            gen_id = cur.fetchone()[0]
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True, "id": gen_id}),
                "isBase64Encoded": False,
            }

        # POST /auth/forgot-password — запросить сброс пароля
        elif method == "POST" and "/forgot-password" in path:
            email = body.get("email", "").strip().lower()
            if not email:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Укажите email"}), "isBase64Encoded": False}

            cur.execute(f"SELECT id FROM {q('users')} WHERE email = %s", (email,))
            row = cur.fetchone()
            if not row:
                # Не раскрываем, существует ли email
                return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True}), "isBase64Encoded": False}

            user_id = row[0]
            # Генерируем 6-значный цифровой код
            import random
            code = str(random.randint(100000, 999999))
            expires = datetime.utcnow() + timedelta(minutes=30)

            # Инвалидируем старые токены
            cur.execute(f"UPDATE {q('password_reset_tokens')} SET used = TRUE WHERE user_id = %s AND used = FALSE", (user_id,))
            cur.execute(
                f"INSERT INTO {q('password_reset_tokens')} (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, code, expires)
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True, "code": code}),
                "isBase64Encoded": False,
            }

        # POST /auth/reset-password — применить новый пароль по коду
        elif method == "POST" and "/reset-password" in path:
            email = body.get("email", "").strip().lower()
            code = body.get("code", "").strip()
            new_password = body.get("new_password", "")

            if not email or not code or not new_password:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Заполните все поля"}), "isBase64Encoded": False}

            if len(new_password) < 6:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Пароль должен быть не менее 6 символов"}), "isBase64Encoded": False}

            cur.execute(f"SELECT id FROM {q('users')} WHERE email = %s", (email,))
            user_row = cur.fetchone()
            if not user_row:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Неверный код или email"}), "isBase64Encoded": False}

            user_id = user_row[0]
            cur.execute(
                f"SELECT id FROM {q('password_reset_tokens')} WHERE user_id = %s AND token = %s AND used = FALSE AND expires_at > NOW()",
                (user_id, code)
            )
            token_row = cur.fetchone()
            if not token_row:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Неверный или просроченный код"}), "isBase64Encoded": False}

            new_hash = hash_password(new_password)
            cur.execute(f"UPDATE {q('users')} SET password_hash = %s, updated_at = NOW() WHERE id = %s", (new_hash, user_id))
            cur.execute(f"UPDATE {q('password_reset_tokens')} SET used = TRUE WHERE id = %s", (token_row[0],))
            # Инвалидируем все сессии
            cur.execute(f"UPDATE {q('user_sessions')} SET expires_at = NOW() WHERE user_id = %s", (user_id,))
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True}),
                "isBase64Encoded": False,
            }

        else:
            return {"statusCode": 404, "headers": cors_headers(), "body": json.dumps({"error": "Not found"}), "isBase64Encoded": False}

    finally:
        cur.close()
        conn.close()