"""
Аутентификация: регистрация, вход, выход, профиль, история генераций, OAuth Яндекс.
"""
import json
import os
import secrets
import hashlib
import hmac
import uuid
import ssl
from datetime import datetime, timedelta
import psycopg2
import urllib.request
import urllib.parse
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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


def send_email_async(to_email: str, subject: str, html: str):
    """Отправляет email через SMTP. Не бросает исключений — только логирует."""
    host = os.environ.get("SMTP_HOST", "")
    port = int(os.environ.get("SMTP_PORT", "465"))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    from_name = os.environ.get("SMTP_FROM_NAME", "ИИ КИРА")

    if not host or not user or not password:
        print("[EMAIL] SMTP не настроен, письмо пропущено")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{user}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=10) as srv:
                srv.login(user, password)
                srv.sendmail(user, to_email, msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=10) as srv:
                srv.starttls()
                srv.login(user, password)
                srv.sendmail(user, to_email, msg.as_string())
        print(f"[EMAIL] Отправлено '{subject}' → {to_email}")
    except Exception as e:
        print(f"[EMAIL] Ошибка: {e}")


def make_email_base(title: str, content: str) -> str:
    return f"""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/><title>{title}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
<tr><td style="background:linear-gradient(135deg,#1a0000,#000820);padding:28px 40px;text-align:center;">
  <div style="font-size:26px;font-weight:900;letter-spacing:3px;color:#fff;">ИИ <span style="color:#ef4444;">КИРА</span></div>
  <div style="font-size:11px;color:#555;letter-spacing:2px;margin-top:4px;">ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ НОВОГО ПОКОЛЕНИЯ</div>
</td></tr>
<tr><td style="padding:32px 40px;">{content}</td></tr>
<tr><td style="background:#0d0d0d;padding:18px 40px;text-align:center;border-top:1px solid #1e1e1e;">
  <p style="margin:0;font-size:12px;color:#444;">© 2024 ИИ КИРА · Это автоматическое письмо</p>
</td></tr>
</table></td></tr></table></body></html>"""


def build_welcome_email(name: str, email: str) -> str:
    display = name or email.split("@")[0]
    content = f"""<h2 style="margin:0 0 14px;color:#fff;font-size:21px;">Добро пожаловать, {display}!</h2>
<p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
  Ваш аккаунт в <strong style="color:#ef4444;">ИИ КИРА</strong> успешно создан.
  Вам доступны инструменты для создания музыки, видео, фото и текста с помощью ИИ.
</p>
<div style="background:#1a1a1a;border-radius:10px;padding:16px 20px;margin:0 0 22px;border-left:3px solid #ef4444;">
  <p style="margin:0;color:#666;font-size:12px;">Ваш аккаунт</p>
  <p style="margin:6px 0 0;color:#fff;font-size:14px;font-weight:bold;">{email}</p>
</div>
<a href="https://kira.ai" style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:13px 30px;border-radius:10px;font-weight:bold;font-size:14px;">Начать создавать →</a>
<p style="margin:22px 0 0;color:#555;font-size:12px;">Если вы не регистрировались — проигнорируйте письмо.</p>"""
    return make_email_base("Добро пожаловать в ИИ КИРА", content)


def build_reset_email(name: str, email: str, code: str) -> str:
    display = name or email.split("@")[0]
    content = f"""<h2 style="margin:0 0 14px;color:#fff;font-size:21px;">Сброс пароля</h2>
<p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
  Привет, {display}! Вот код для сброса пароля аккаунта <strong style="color:#fff;">{email}</strong>:
</p>
<div style="background:#1a0000;border:2px solid #ef4444;border-radius:12px;padding:22px;text-align:center;margin:0 0 20px;">
  <span style="font-size:38px;font-weight:900;letter-spacing:10px;color:#ef4444;font-family:monospace;">{code}</span>
</div>
<p style="color:#666;font-size:13px;margin:0 0 16px;">⏱ Код действителен <strong style="color:#aaa;">30 минут</strong>. Никому не сообщайте его.</p>
<p style="color:#555;font-size:12px;margin:0;">Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>"""
    return make_email_base("Сброс пароля — ИИ КИРА", content)


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
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization, X-Session-Id, X-User-Id, X-Auth-Token",
        "Access-Control-Max-Age": "86400",
        "Content-Type": "application/json",
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


GIGACHAT_SYSTEM_PROMPT = (
    "Ты — Кира, умный ИИ-ассистент платформы «ИИ КИРА». "
    "Помогаешь пользователям создавать музыку, видео, фото и текст с помощью искусственного интеллекта. "
    "Отвечаешь на русском языке, коротко и по делу. "
    "Если пользователь спрашивает про генерацию контента — подсказываешь как лучше составить промпт. "
    "Если вопрос не по теме — всё равно отвечаешь дружелюбно и полезно."
)


def gigachat_get_token(api_key: str) -> str:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    data = urllib.parse.urlencode({"scope": "GIGACHAT_API_PERS"}).encode()
    req = urllib.request.Request(
        "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
        data=data,
        headers={
            "Authorization": f"Basic {api_key}",
            "RqUID": str(uuid.uuid4()),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        return json.loads(resp.read().decode())["access_token"]


def gigachat_chat(token: str, messages: list) -> str:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    payload = json.dumps({
        "model": "GigaChat",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024,
    }).encode()
    req = urllib.request.Request(
        "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        return json.loads(resp.read().decode())["choices"][0]["message"]["content"]


def handler(event: dict, context) -> dict:
    """Регистрация, вход, выход, профиль, история генераций пользователя"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": "", "isBase64Encoded": False}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/") or "/"
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    # Определяем action из body, query или path
    qp = event.get("queryStringParameters") or {}
    action = ""
    if isinstance(body, dict):
        action = (body.get("action") or "").strip().lower()
    if not action:
        action = (qp.get("action") or "").strip().lower()
    # Если path пустой или корневой — используем action как путь
    if path == "/" or path == "":
        if action:
            path = "/" + action

    print(f"[DEBUG] method={method} path={path} action={action} body_keys={list(body.keys()) if isinstance(body, dict) else 'n/a'}")

    try:
        conn = get_db()
        cur = conn.cursor()
    except Exception as e:
        print(f"[ERROR] DB connect failed: {e}")
        return {"statusCode": 500, "headers": cors_headers(), "body": json.dumps({"error": "Ошибка подключения к базе данных"}), "isBase64Encoded": False}

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

            # Приветственное письмо
            send_email_async(email, "Добро пожаловать в ИИ КИРА!", build_welcome_email(name, email))

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"token": token, "user": {"id": user_id, "email": email, "name": name, "role": "user"}}),
                "isBase64Encoded": False,
            }

        # GET /auth/me
        elif method == "GET" and ("/me" in path or action == "me"):
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
        elif method == "POST" and ("/logout" in path or action == "logout"):
            token = get_token_from_event(event)
            if token:
                cur.execute(f"UPDATE {q('user_sessions')} SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True}), "isBase64Encoded": False}

        # GET /auth/profile — полный профиль с подпиской
        elif method == "GET" and ("/profile" in path or action == "profile"):
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
        elif method == "PUT" and ("/profile" in path or action == "profile"):
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
        elif method == "PUT" and ("/password" in path or action == "password"):
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
        elif method == "GET" and ("/history" in path or action == "history"):
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
        elif method == "POST" and ("/generation" in path or action == "generation"):
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

            # Получаем имя пользователя для письма
            cur.execute(f"SELECT name FROM {q('users')} WHERE id = %s", (user_id,))
            name_row = cur.fetchone()
            user_name = name_row[0] if name_row else ""

            # Отправляем код на email
            send_email_async(email, "Код сброса пароля — ИИ КИРА", build_reset_email(user_name, email, code))

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True}),
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

        # GET /auth/yandex — редирект на Яндекс OAuth
        elif method == "GET" and "/yandex" in path and "/callback" not in path:
            client_id = os.environ.get("YANDEX_CLIENT_ID", "")
            params = urllib.parse.urlencode({
                "response_type": "code",
                "client_id": client_id,
            })
            redirect_url = f"https://oauth.yandex.ru/authorize?{params}"
            return {
                "statusCode": 302,
                "headers": {**cors_headers(), "Location": redirect_url},
                "body": "",
                "isBase64Encoded": False,
            }

        # GET /auth/yandex/callback — обработка кода от Яндекс
        elif method == "GET" and "/yandex/callback" in path:
            params = event.get("queryStringParameters") or {}
            code = params.get("code", "")
            redirect_origin = params.get("state", "")

            if not code:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Код не передан"}), "isBase64Encoded": False}

            client_id = os.environ.get("YANDEX_CLIENT_ID", "")
            client_secret = os.environ.get("YANDEX_CLIENT_SECRET", "")

            # Обмениваем code на access_token
            token_data = urllib.parse.urlencode({
                "grant_type": "authorization_code",
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
            }).encode()
            req = urllib.request.Request("https://oauth.yandex.ru/token", data=token_data, method="POST")
            try:
                with urllib.request.urlopen(req) as resp:
                    token_json = json.loads(resp.read().decode())
            except Exception as e:
                print(f"[ERROR] Yandex token exchange failed: {e}")
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Ошибка получения токена Яндекс"}), "isBase64Encoded": False}

            access_token = token_json.get("access_token", "")
            if not access_token:
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Токен Яндекс не получен"}), "isBase64Encoded": False}

            # Получаем профиль пользователя
            info_req = urllib.request.Request(
                "https://login.yandex.ru/info?format=json",
                headers={"Authorization": f"OAuth {access_token}"}
            )
            try:
                with urllib.request.urlopen(info_req) as resp:
                    yandex_user = json.loads(resp.read().decode())
            except Exception as e:
                print(f"[ERROR] Yandex user info failed: {e}")
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Ошибка получения профиля Яндекс"}), "isBase64Encoded": False}

            yandex_id = str(yandex_user.get("id", ""))
            email = yandex_user.get("default_email", "") or yandex_user.get("emails", [""])[0] if yandex_user.get("emails") else ""
            name = yandex_user.get("display_name") or yandex_user.get("real_name") or yandex_user.get("login", "")

            if not yandex_id:
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Не удалось получить ID Яндекс"}), "isBase64Encoded": False}

            SCHEMA_Q = os.environ.get("MAIN_DB_SCHEMA", "public")

            # Ищем существующего пользователя по oauth или email
            cur.execute(
                f'SELECT id, email, name, role, status FROM "{SCHEMA_Q}".users WHERE oauth_provider = %s AND oauth_id = %s',
                ("yandex", yandex_id)
            )
            row = cur.fetchone()

            if not row and email:
                cur.execute(f'SELECT id, email, name, role, status FROM "{SCHEMA_Q}".users WHERE email = %s', (email,))
                row = cur.fetchone()
                if row:
                    # Привязываем oauth к существующему аккаунту
                    cur.execute(
                        f'UPDATE "{SCHEMA_Q}".users SET oauth_provider = %s, oauth_id = %s WHERE id = %s',
                        ("yandex", yandex_id, row[0])
                    )

            if not row:
                # Создаём нового пользователя
                cur.execute(
                    f'INSERT INTO "{SCHEMA_Q}".users (email, password_hash, name, role, status, oauth_provider, oauth_id) '
                    f"VALUES (%s, %s, %s, 'user', 'active', %s, %s) RETURNING id, email, name, role, status",
                    (email or f"yandex_{yandex_id}@oauth", "", name, "yandex", yandex_id)
                )
                row = cur.fetchone()

            user_id, user_email, user_name, role, status = row

            if status == "blocked":
                return {"statusCode": 403, "headers": cors_headers(), "body": json.dumps({"error": "Аккаунт заблокирован"}), "isBase64Encoded": False}

            session_token = secrets.token_urlsafe(48)
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(
                f'INSERT INTO "{SCHEMA_Q}".user_sessions (user_id, token, expires_at) VALUES (%s, %s, %s)',
                (user_id, session_token, expires)
            )
            cur.execute(f'UPDATE "{SCHEMA_Q}".users SET last_login_at = NOW() WHERE id = %s', (user_id,))
            conn.commit()

            # Редирект на фронт с токеном
            front_url = os.environ.get("FRONTEND_URL", "https://poehali.dev")
            user_payload = urllib.parse.quote(json.dumps({"id": user_id, "email": user_email, "name": user_name, "role": role}))
            redirect_to = f"{front_url}/auth/callback?token={session_token}&user={user_payload}"
            return {
                "statusCode": 302,
                "headers": {**cors_headers(), "Location": redirect_to},
                "body": "",
                "isBase64Encoded": False,
            }

        # GET /auth/vk — редирект на ВКонтакте OAuth
        elif method == "GET" and "/vk" in path and "/callback" not in path:
            client_id = os.environ.get("VK_CLIENT_ID", "")
            params = urllib.parse.urlencode({
                "client_id": client_id,
                "redirect_uri": f"https://functions.poehali.dev/f53ec6b3-3efc-418d-a138-9d6235d3f56c/vk/callback",
                "response_type": "code",
                "scope": "email",
                "v": "5.131",
            })
            redirect_url = f"https://oauth.vk.com/authorize?{params}"
            return {
                "statusCode": 302,
                "headers": {**cors_headers(), "Location": redirect_url},
                "body": "",
                "isBase64Encoded": False,
            }

        # GET /auth/vk/callback — обработка кода от ВКонтакте
        elif method == "GET" and "/vk/callback" in path:
            params = event.get("queryStringParameters") or {}
            code = params.get("code", "")

            if not code:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Код не передан"}), "isBase64Encoded": False}

            client_id = os.environ.get("VK_CLIENT_ID", "")
            client_secret = os.environ.get("VK_CLIENT_SECRET", "")
            redirect_uri = "https://functions.poehali.dev/f53ec6b3-3efc-418d-a138-9d6235d3f56c/vk/callback"

            # Обмениваем code на access_token
            token_params = urllib.parse.urlencode({
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "code": code,
            })
            req = urllib.request.Request(f"https://oauth.vk.com/access_token?{token_params}")
            try:
                with urllib.request.urlopen(req) as resp:
                    token_json = json.loads(resp.read().decode())
            except Exception as e:
                print(f"[ERROR] VK token exchange failed: {e}")
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Ошибка получения токена ВК"}), "isBase64Encoded": False}

            access_token = token_json.get("access_token", "")
            vk_id = str(token_json.get("user_id", ""))
            email = token_json.get("email", "")

            if not access_token or not vk_id:
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Токен ВК не получен"}), "isBase64Encoded": False}

            # Получаем имя пользователя
            user_params = urllib.parse.urlencode({
                "user_ids": vk_id,
                "fields": "first_name,last_name",
                "access_token": access_token,
                "v": "5.131",
            })
            info_req = urllib.request.Request(f"https://api.vk.com/method/users.get?{user_params}")
            try:
                with urllib.request.urlopen(info_req) as resp:
                    vk_info = json.loads(resp.read().decode())
                vk_user = vk_info.get("response", [{}])[0]
                name = f"{vk_user.get('first_name', '')} {vk_user.get('last_name', '')}".strip()
            except Exception:
                name = f"vk_{vk_id}"

            SCHEMA_Q = os.environ.get("MAIN_DB_SCHEMA", "public")

            # Ищем существующего пользователя по oauth или email
            cur.execute(
                f'SELECT id, email, name, role, status FROM "{SCHEMA_Q}".users WHERE oauth_provider = %s AND oauth_id = %s',
                ("vk", vk_id)
            )
            row = cur.fetchone()

            if not row and email:
                cur.execute(f'SELECT id, email, name, role, status FROM "{SCHEMA_Q}".users WHERE email = %s', (email,))
                row = cur.fetchone()
                if row:
                    cur.execute(
                        f'UPDATE "{SCHEMA_Q}".users SET oauth_provider = %s, oauth_id = %s WHERE id = %s',
                        ("vk", vk_id, row[0])
                    )

            if not row:
                cur.execute(
                    f'INSERT INTO "{SCHEMA_Q}".users (email, password_hash, name, role, status, oauth_provider, oauth_id) '
                    f"VALUES (%s, %s, %s, 'user', 'active', %s, %s) RETURNING id, email, name, role, status",
                    (email or f"vk_{vk_id}@oauth", "", name, "vk", vk_id)
                )
                row = cur.fetchone()

            user_id, user_email, user_name, role, status = row

            if status == "blocked":
                return {"statusCode": 403, "headers": cors_headers(), "body": json.dumps({"error": "Аккаунт заблокирован"}), "isBase64Encoded": False}

            session_token = secrets.token_urlsafe(48)
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(
                f'INSERT INTO "{SCHEMA_Q}".user_sessions (user_id, token, expires_at) VALUES (%s, %s, %s)',
                (user_id, session_token, expires)
            )
            cur.execute(f'UPDATE "{SCHEMA_Q}".users SET last_login_at = NOW() WHERE id = %s', (user_id,))
            conn.commit()

            front_url = os.environ.get("FRONTEND_URL", "https://poehali.dev")
            user_payload = urllib.parse.quote(json.dumps({"id": user_id, "email": user_email, "name": user_name, "role": role}))
            redirect_to = f"{front_url}/auth/callback?token={session_token}&user={user_payload}"
            return {
                "statusCode": 302,
                "headers": {**cors_headers(), "Location": redirect_to},
                "body": "",
                "isBase64Encoded": False,
            }

        # GET /auth/mailru — редирект на Mail.ru OAuth
        elif method == "GET" and "/mailru" in path and "/callback" not in path:
            client_id = os.environ.get("MAILRU_CLIENT_ID", "")
            redirect_uri = "https://functions.poehali.dev/f53ec6b3-3efc-418d-a138-9d6235d3f56c/mailru/callback"
            params = urllib.parse.urlencode({
                "client_id": client_id,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "userinfo",
            })
            redirect_url = f"https://oauth.mail.ru/login?{params}"
            return {
                "statusCode": 302,
                "headers": {**cors_headers(), "Location": redirect_url},
                "body": "",
                "isBase64Encoded": False,
            }

        # GET /auth/mailru/callback — обработка кода от Mail.ru
        elif method == "GET" and "/mailru/callback" in path:
            params = event.get("queryStringParameters") or {}
            code = params.get("code", "")

            if not code:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Код не передан"}), "isBase64Encoded": False}

            client_id = os.environ.get("MAILRU_CLIENT_ID", "")
            client_secret = os.environ.get("MAILRU_CLIENT_SECRET", "")
            redirect_uri = "https://functions.poehali.dev/f53ec6b3-3efc-418d-a138-9d6235d3f56c/mailru/callback"

            # Обмениваем code на access_token
            token_data = urllib.parse.urlencode({
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": client_id,
                "client_secret": client_secret,
            }).encode()
            req = urllib.request.Request(
                "https://oauth.mail.ru/token",
                data=token_data,
                method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    token_json = json.loads(resp.read().decode())
            except Exception as e:
                print(f"[ERROR] Mail.ru token exchange failed: {e}")
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Ошибка получения токена Mail.ru"}), "isBase64Encoded": False}

            access_token = token_json.get("access_token", "")
            if not access_token:
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Токен Mail.ru не получен"}), "isBase64Encoded": False}

            # Получаем профиль пользователя
            info_params = urllib.parse.urlencode({"access_token": access_token})
            info_req = urllib.request.Request(f"https://oauth.mail.ru/userinfo?{info_params}")
            try:
                with urllib.request.urlopen(info_req) as resp:
                    mailru_user = json.loads(resp.read().decode())
            except Exception as e:
                print(f"[ERROR] Mail.ru userinfo failed: {e}")
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Ошибка получения профиля Mail.ru"}), "isBase64Encoded": False}

            mailru_id = str(mailru_user.get("id", ""))
            email = mailru_user.get("email", "")
            first = mailru_user.get("first_name", "")
            last = mailru_user.get("last_name", "")
            name = f"{first} {last}".strip() or mailru_user.get("nick", "") or f"mailru_{mailru_id}"

            if not mailru_id:
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Не удалось получить ID Mail.ru"}), "isBase64Encoded": False}

            SCHEMA_Q = os.environ.get("MAIN_DB_SCHEMA", "public")

            cur.execute(
                f'SELECT id, email, name, role, status FROM "{SCHEMA_Q}".users WHERE oauth_provider = %s AND oauth_id = %s',
                ("mailru", mailru_id)
            )
            row = cur.fetchone()

            if not row and email:
                cur.execute(f'SELECT id, email, name, role, status FROM "{SCHEMA_Q}".users WHERE email = %s', (email,))
                row = cur.fetchone()
                if row:
                    cur.execute(
                        f'UPDATE "{SCHEMA_Q}".users SET oauth_provider = %s, oauth_id = %s WHERE id = %s',
                        ("mailru", mailru_id, row[0])
                    )

            if not row:
                cur.execute(
                    f'INSERT INTO "{SCHEMA_Q}".users (email, password_hash, name, role, status, oauth_provider, oauth_id) '
                    f"VALUES (%s, %s, %s, 'user', 'active', %s, %s) RETURNING id, email, name, role, status",
                    (email or f"mailru_{mailru_id}@oauth", "", name, "mailru", mailru_id)
                )
                row = cur.fetchone()

            user_id, user_email, user_name, role, status = row

            if status == "blocked":
                return {"statusCode": 403, "headers": cors_headers(), "body": json.dumps({"error": "Аккаунт заблокирован"}), "isBase64Encoded": False}

            session_token = secrets.token_urlsafe(48)
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(
                f'INSERT INTO "{SCHEMA_Q}".user_sessions (user_id, token, expires_at) VALUES (%s, %s, %s)',
                (user_id, session_token, expires)
            )
            cur.execute(f'UPDATE "{SCHEMA_Q}".users SET last_login_at = NOW() WHERE id = %s', (user_id,))
            conn.commit()

            front_url = os.environ.get("FRONTEND_URL", "https://poehali.dev")
            user_payload = urllib.parse.quote(json.dumps({"id": user_id, "email": user_email, "name": user_name, "role": role}))
            redirect_to = f"{front_url}/auth/callback?token={session_token}&user={user_payload}"
            return {
                "statusCode": 302,
                "headers": {**cors_headers(), "Location": redirect_to},
                "body": "",
                "isBase64Encoded": False,
            }

        # POST /auth/ticket — создать тикет поддержки
        elif method == "POST" and "/ticket" in path:
            email = body.get("email", "").strip().lower()
            topic = body.get("topic", "").strip()
            message = body.get("message", "").strip()

            if not email or not topic or not message:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "email, topic и message обязательны"}), "isBase64Encoded": False}

            if len(message) < 10:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Описание слишком короткое — минимум 10 символов"}), "isBase64Encoded": False}

            subject = f"[{topic}] {email}"
            priority = "high" if any(w in topic.lower() for w in ["оплат", "платёж", "платеж"]) else "normal"

            # Определяем user_id если пользователь авторизован
            user_id = None
            token_hdr = (event.get("headers") or {}).get("X-Authorization", "")
            tok = token_hdr.replace("Bearer ", "").strip()
            if tok:
                row_u = get_user_by_token(cur, tok)
                if row_u:
                    user_id = row_u[0]

            cur.execute(
                f"INSERT INTO {q('support_tickets')} (user_id, subject, body, status, priority) "
                f"VALUES (%s, %s, %s, 'new', %s) RETURNING id, created_at",
                (user_id, subject, message, priority)
            )
            ticket_id, created_at = cur.fetchone()

            cur.execute(
                f"INSERT INTO {q('ticket_messages')} (ticket_id, user_id, body, is_internal) VALUES (%s, %s, %s, FALSE)",
                (ticket_id, user_id, message)
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"ok": True, "ticket_id": ticket_id, "created_at": str(created_at)}),
                "isBase64Encoded": False,
            }

        # POST /auth/chat — чат с Кирой (GigaChat)
        elif method == "POST" and "/chat" in path:
            user_message = body.get("message", "").strip()
            history = body.get("history", [])

            if not user_message:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Сообщение не может быть пустым"}), "isBase64Encoded": False}

            api_key = os.environ.get("GIGACHAT_API_KEY", "")
            if not api_key:
                return {"statusCode": 500, "headers": cors_headers(), "body": json.dumps({"error": "ИИ не настроен"}), "isBase64Encoded": False}

            messages = [{"role": "system", "content": GIGACHAT_SYSTEM_PROMPT}]
            for msg in history[-20:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})
            messages.append({"role": "user", "content": user_message})

            try:
                access_token = gigachat_get_token(api_key)
                reply = gigachat_chat(access_token, messages)
            except Exception as e:
                print(f"[GIGACHAT ERROR] {type(e).__name__}: {e}")
                return {"statusCode": 502, "headers": cors_headers(), "body": json.dumps({"error": "Не удалось получить ответ от ИИ. Попробуйте позже."}), "isBase64Encoded": False}

            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"reply": reply}, ensure_ascii=False),
                "isBase64Encoded": False,
            }

        # GET /auth/tickets — список своих тикетов (для авторизованных)
        elif method == "GET" and "/tickets" in path:
            token_hdr = (event.get("headers") or {}).get("X-Authorization", "")
            tok = token_hdr.replace("Bearer ", "").strip()
            if not tok:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Необходима авторизация"}), "isBase64Encoded": False}

            row_u = get_user_by_token(cur, tok)
            if not row_u:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"}), "isBase64Encoded": False}

            uid = row_u[0]
            cur.execute(
                f"SELECT id, subject, status, priority, created_at, updated_at "
                f"FROM {q('support_tickets')} WHERE user_id = %s ORDER BY created_at DESC LIMIT 20",
                (uid,)
            )
            tickets = [
                {"id": r[0], "subject": r[1], "status": r[2], "priority": r[3],
                 "created_at": str(r[4]), "updated_at": str(r[5])}
                for r in cur.fetchall()
            ]
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"tickets": tickets}),
                "isBase64Encoded": False,
            }

        else:
            return {"statusCode": 404, "headers": cors_headers(), "body": json.dumps({"error": "Not found", "method": method, "path": path}), "isBase64Encoded": False}

    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        print(f"[ERROR] Unhandled exception: {type(e).__name__}: {e}")
        return {"statusCode": 500, "headers": cors_headers(), "body": json.dumps({"error": "Внутренняя ошибка сервера", "detail": f"{type(e).__name__}: {e}"}), "isBase64Encoded": False}

    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass