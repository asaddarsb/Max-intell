# Forms & email — what was wrong and how to finish it

## What the message meant
"Your message was received. Email delivery is not configured, but your inquiry has
been stored." = the form worked, the data was saved, but PHP's `mail()` didn't
actually deliver on your host. So submissions were piling up in a log file, unsent.

Two things to know:
1. **Your existing inquiries are not lost.** They're in `contact-submissions.log`
   next to `send-email.php` on the server. Download it via FTP / file manager to read
   any leads captured so far, then you can delete it.
2. The new `send-email.php` sends via **authenticated SMTP** (reliable), with `mail()`
   and the log as fallbacks. PHPMailer is already bundled in `phpmailer/`.

## To turn on real email delivery (2 minutes)
Open `send-email.php` and fill in the SMTP block near the top:

    'host'     => 'mail.max-intell.com',   // cPanel: usually mail.<yourdomain>
    'port'     => 465,                      // 465 with 'ssl', OR 587 with 'tls'
    'secure'   => 'ssl',
    'username' => 'sales@max-intell.com',   // a REAL mailbox on your domain
    'password' => 'the mailbox password',   // <-- the only required change
    'from'     => 'sales@max-intell.com',   // keep on your own domain (SPF/DKIM)

Find the exact host/port in cPanel → Email Accounts → "Connect Devices" (Mail Client
Settings). Create the `sales@` mailbox first if it doesn't exist.

More secure option (avoids a password sitting in the file): leave `password` blank and
instead set environment variables `SMTP_PASS`, `SMTP_HOST`, `SMTP_USER` (cPanel:
"Application Manager" or a `.htaccess` `SetEnv`). The script reads those automatically.

## Test
Submit any form. On success you'll now see **"…has been sent successfully."** and the
email arrives at `sales@max-intell.com`. If it still says "stored":
- Wrong host/port/password, or the mailbox doesn't exist → recheck the Mail Client Settings.
- Port 465 needs `'secure' => 'ssl'`; port 587 needs `'secure' => 'tls'`.
- Check the server error log for lines starting "Contact form SMTP failed".

## Don't want to run SMTP?
Set `'enabled' => false` in the SMTP block and instead use a form service
(Formspree / Web3Forms / Brevo): point each form's `action` at their endpoint. Tell me
which and I'll wire it. The forms also already fall back to opening the visitor's email
app if the endpoint is ever unreachable, so nothing is lost either way.

Forms covered: contact page, the Talk-to-Expert modal (all pages), and the e_s_p demo form.
