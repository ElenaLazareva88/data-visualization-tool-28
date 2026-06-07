"""
Утилита отправки email через SMTP. Вызывается внутренне из других функций.
Поддерживает: приветствие при регистрации, код сброса пароля, подтверждение оплаты.
"""
import os
import smtplib
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def get_smtp_config():
    return {
        "host": os.environ.get("SMTP_HOST", ""),
        "port": int(os.environ.get("SMTP_PORT", "465")),
        "user": os.environ.get("SMTP_USER", ""),
        "password": os.environ.get("SMTP_PASSWORD", ""),
        "from_name": os.environ.get("SMTP_FROM_NAME", "ИИ КИРА"),
    }


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    cfg = get_smtp_config()
    if not cfg["host"] or not cfg["user"] or not cfg["password"]:
        print("[EMAIL] SMTP не настроен — письмо не отправлено")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f'{cfg["from_name"]} <{cfg["user"]}>'
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if cfg["port"] == 465:
            with smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=15) as server:
                server.login(cfg["user"], cfg["password"])
                server.sendmail(cfg["user"], to_email, msg.as_string())
        else:
            with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as server:
                server.starttls()
                server.login(cfg["user"], cfg["password"])
                server.sendmail(cfg["user"], to_email, msg.as_string())
        print(f"[EMAIL] Отправлено: {subject} → {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] Ошибка отправки: {e}")
        return False


def make_base_template(title: str, content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;overflow:hidden;border:1px solid #222;">
        <!-- Шапка -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0000 0%,#000820 100%);padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:900;letter-spacing:3px;color:#ffffff;">ИИ <span style="color:#ef4444;">КИРА</span></div>
            <div style="font-size:11px;color:#666;letter-spacing:2px;margin-top:4px;text-transform:uppercase;">Искусственный интеллект нового поколения</div>
          </td>
        </tr>
        <!-- Контент -->
        <tr>
          <td style="padding:36px 40px;">
            {content}
          </td>
        </tr>
        <!-- Подвал -->
        <tr>
          <td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid #1e1e1e;">
            <p style="margin:0;font-size:12px;color:#444;">© 2024 ИИ КИРА. Это автоматическое письмо, не отвечайте на него.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def email_welcome(name: str, email: str) -> str:
    display = name or email.split("@")[0]
    content = f"""
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Добро пожаловать, {display}! 🎉</h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Твой аккаунт в <strong style="color:#ef4444;">ИИ КИРА</strong> успешно создан.
      Теперь тебе доступны инструменты для создания музыки, видео, фото и текста с помощью искусственного интеллекта.
    </p>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;border-left:3px solid #ef4444;">
      <p style="margin:0;color:#888;font-size:13px;">Ваш аккаунт</p>
      <p style="margin:6px 0 0;color:#fff;font-size:15px;font-weight:bold;">{email}</p>
    </div>
    <a href="https://kira.ai" style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px;">
      Начать создавать →
    </a>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">Если вы не регистрировались — просто проигнорируйте это письмо.</p>
    """
    return make_base_template("Добро пожаловать в ИИ КИРА", content)


def email_reset_code(name: str, email: str, code: str) -> str:
    display = name or email.split("@")[0]
    content = f"""
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Сброс пароля</h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Привет, {display}! Мы получили запрос на сброс пароля для аккаунта <strong style="color:#fff;">{email}</strong>.
    </p>
    <p style="color:#aaa;font-size:14px;margin:0 0 12px;">Ваш код подтверждения:</p>
    <div style="background:#1a0000;border:2px solid #ef4444;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#ef4444;font-family:monospace;">{code}</span>
    </div>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">
      ⏱ Код действителен <strong style="color:#aaa;">30 минут</strong>. Никому не сообщайте его.
    </p>
    <p style="color:#555;font-size:13px;margin:0;">Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо. Ваш пароль останется прежним.</p>
    """
    return make_base_template("Сброс пароля — ИИ КИРА", content)


def email_payment_success(name: str, email: str, order_number: str, amount: str) -> str:
    display = name or email.split("@")[0]
    content = f"""
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Оплата прошла успешно ✅</h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Привет, {display}! Ваш платёж успешно обработан. Спасибо, что выбрали <strong style="color:#ef4444;">ИИ КИРА</strong>!
    </p>
    <div style="background:#001a0a;border:1px solid #16a34a;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:13px;padding-bottom:8px;">Номер заказа</td>
          <td style="color:#fff;font-size:13px;font-weight:bold;text-align:right;padding-bottom:8px;">#{order_number}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:13px;">Сумма</td>
          <td style="color:#22c55e;font-size:18px;font-weight:900;text-align:right;">{amount} ₽</td>
        </tr>
      </table>
    </div>
    <a href="https://kira.ai" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px;">
      Перейти в кабинет →
    </a>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">Если у вас есть вопросы по заказу — обратитесь в поддержку.</p>
    """
    return make_base_template("Оплата прошла — ИИ КИРА", content)


def handler(event: dict, context) -> dict:
    """Отправка email: welcome, reset_code, payment_success. Вызывается внутренне."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    email_type = body.get("type", "")
    to_email = body.get("email", "")
    name = body.get("name", "")

    if not email_type or not to_email:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "type и email обязательны"})}

    if email_type == "welcome":
        html = email_welcome(name, to_email)
        subject = "Добро пожаловать в ИИ КИРА!"

    elif email_type == "reset_code":
        code = body.get("code", "")
        if not code:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "code обязателен"})}
        html = email_reset_code(name, to_email, code)
        subject = "Код сброса пароля — ИИ КИРА"

    elif email_type == "payment_success":
        order_number = body.get("order_number", "—")
        amount = body.get("amount", "—")
        html = email_payment_success(name, to_email, order_number, amount)
        subject = "Оплата прошла успешно — ИИ КИРА"

    else:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": f"Неизвестный тип: {email_type}"})}

    ok = send_email(to_email, subject, html)
    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({"ok": ok}),
    }
