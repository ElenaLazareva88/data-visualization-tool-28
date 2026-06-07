import json
import os
import hashlib
import psycopg2
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from urllib.parse import parse_qs


def calculate_signature(*args) -> str:
    """Создание MD5 подписи по документации Robokassa"""
    joined = ':'.join(str(arg) for arg in args)
    return hashlib.md5(joined.encode()).hexdigest().upper()


def send_payment_email(to_email: str, name: str, order_number: str, amount: str):
    host = os.environ.get("SMTP_HOST", "")
    port = int(os.environ.get("SMTP_PORT", "465"))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    from_name = os.environ.get("SMTP_FROM_NAME", "ИИ КИРА")

    if not host or not user or not password:
        print("[EMAIL] SMTP не настроен")
        return

    display = name or to_email.split("@")[0]
    html = f"""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
<tr><td style="background:linear-gradient(135deg,#1a0000,#000820);padding:28px 40px;text-align:center;">
  <div style="font-size:26px;font-weight:900;letter-spacing:3px;color:#fff;">ИИ <span style="color:#ef4444;">КИРА</span></div>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 14px;color:#fff;font-size:21px;">Оплата прошла успешно ✅</h2>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
    Привет, {display}! Ваш платёж успешно обработан. Спасибо, что выбрали <strong style="color:#ef4444;">ИИ КИРА</strong>!
  </p>
  <div style="background:#001a0a;border:1px solid #16a34a;border-radius:12px;padding:20px;margin:0 0 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#666;font-size:13px;padding-bottom:8px;">Номер заказа</td>
        <td style="color:#fff;font-size:13px;font-weight:bold;text-align:right;padding-bottom:8px;">#{order_number}</td>
      </tr>
      <tr>
        <td style="color:#666;font-size:13px;">Сумма оплаты</td>
        <td style="color:#22c55e;font-size:18px;font-weight:900;text-align:right;">{amount} ₽</td>
      </tr>
    </table>
  </div>
  <a href="https://kira.ai" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:13px 30px;border-radius:10px;font-weight:bold;font-size:14px;">Перейти в кабинет →</a>
  <p style="margin:22px 0 0;color:#555;font-size:12px;">Если у вас вопросы — обратитесь в поддержку.</p>
</td></tr>
<tr><td style="background:#0d0d0d;padding:18px 40px;text-align:center;border-top:1px solid #1e1e1e;">
  <p style="margin:0;font-size:12px;color:#444;">© 2024 ИИ КИРА · Это автоматическое письмо</p>
</td></tr>
</table></td></tr></table></body></html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Оплата прошла успешно — ИИ КИРА"
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
        print(f"[EMAIL] Письмо об оплате отправлено → {to_email}")
    except Exception as e:
        print(f"[EMAIL] Ошибка: {e}")


def get_db_connection():
    """Получение подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not configured')
    return psycopg2.connect(dsn)


HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/plain'
}


def handler(event: dict, context) -> dict:
    '''
    Result URL вебхук от Robokassa для подтверждения оплаты.
    Robokassa отправляет: OutSum, InvId, SignatureValue
    Returns: OK{InvId} если подпись верна и заказ обновлён
    '''
    method = event.get('httpMethod', 'GET').upper()

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': '', 'isBase64Encoded': False}

    password_2 = os.environ.get('ROBOKASSA_PASSWORD_2')
    if not password_2:
        return {'statusCode': 500, 'headers': HEADERS, 'body': 'Configuration error', 'isBase64Encoded': False}

    # Парсинг параметров из body или query string
    params = {}
    body = event.get('body', '')

    if method == 'POST' and body:
        if event.get('isBase64Encoded', False):
            import base64
            body = base64.b64decode(body).decode('utf-8')
        parsed = parse_qs(body)
        params = {k: v[0] for k, v in parsed.items()}

    if not params:
        params = event.get('queryStringParameters') or {}

    out_sum = params.get('OutSum', params.get('out_summ', ''))
    inv_id = params.get('InvId', params.get('inv_id', ''))
    signature_value = params.get('SignatureValue', params.get('crc', '')).upper()

    if not out_sum or not inv_id or not signature_value:
        return {'statusCode': 400, 'headers': HEADERS, 'body': 'Missing required parameters', 'isBase64Encoded': False}

    # Проверка подписи
    expected_signature = calculate_signature(out_sum, inv_id, password_2)
    if signature_value != expected_signature:
        return {'statusCode': 400, 'headers': HEADERS, 'body': 'Invalid signature', 'isBase64Encoded': False}

    # Обновление статуса заказа
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE orders
        SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE robokassa_inv_id = %s AND status = 'pending'
        RETURNING id, order_number, user_email
    """, (int(inv_id),))

    result = cur.fetchone()

    if not result:
        # Проверяем, может уже оплачен
        cur.execute("SELECT status FROM orders WHERE robokassa_inv_id = %s", (int(inv_id),))
        existing = cur.fetchone()
        conn.close()

        if existing and existing[0] == 'paid':
            return {'statusCode': 200, 'headers': HEADERS, 'body': f'OK{inv_id}', 'isBase64Encoded': False}
        return {'statusCode': 404, 'headers': HEADERS, 'body': 'Order not found', 'isBase64Encoded': False}

    conn.commit()
    cur.close()
    conn.close()

    order_id, order_number, user_email = result

    # Получаем имя пользователя и сумму
    conn2 = get_db_connection()
    cur2 = conn2.cursor()
    cur2.execute("SELECT u.name, o.total_amount FROM orders o LEFT JOIN users u ON u.email = o.user_email WHERE o.id = %s", (order_id,))
    extra = cur2.fetchone()
    conn2.close()

    user_name = extra[0] if extra and extra[0] else ""
    amount = str(int(extra[1])) if extra and extra[1] else "—"

    if user_email:
        send_payment_email(user_email, user_name, str(order_number), amount)

    return {'statusCode': 200, 'headers': HEADERS, 'body': f'OK{inv_id}', 'isBase64Encoded': False}