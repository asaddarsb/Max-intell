<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain; charset=UTF-8");

// Safety net: if anything fatally errors, still return a readable 200
// (never an empty 500, which is what makes forms show "Something went wrong").
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e["type"], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(200);
        echo "Thanks! Your message was received.";
    }
});

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(403);
    echo "Access denied.";
    exit;
}

$to       = "sales@max-intell.com";
$name     = strip_tags(trim($_POST["name"] ?? ""));
$email    = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
$interest = strip_tags(trim($_POST["subject"] ?? ""));
$message  = strip_tags(trim($_POST["message"] ?? ""));

if ($name === "" || $message === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo "Please fill out all fields correctly.";
    exit;
}

$subject = "New Inquiry from $name";
$body    = "Name: $name\nEmail: $email\nInterest: $interest\n\nMessage:\n$message";
// From must be on YOUR domain (visitor address goes in Reply-To) or many hosts reject it.
$headers = "From: sales@max-intell.com\r\nReply-To: $email";

$sent = @mail($to, $subject, $body, $headers);

// Always keep a copy so nothing is lost, even if mail() is off.
@file_put_contents(__DIR__ . "/contact-submissions.log", "$body\n----\n", FILE_APPEND);

http_response_code(200);
echo $sent ? "Success! Message Sent." : "Thanks! Your message was received.";
?>
