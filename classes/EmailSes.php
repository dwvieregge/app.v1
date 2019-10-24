<?php


namespace Classes;


use \Aws\Ses\SesClient;
use \Aws\Exception\AwsException;

class EmailSes
{
    private $sender_email;
    private $SesClient;
    private $configuration_set;
    private $char_set;

    public $recipient_emails;
    public $subject;
    public $plaintext_body;
    public $html_body;

    function __construct()
    {
        $this->SesClient = new SesClient([
            'profile' => 'default',
            'version' => '2010-12-01',
            'region' => 'us-west-2'
        ]);

        /**
         * $client = SesClient::factory(array(
        'key'    => $userid,
        'secret' => $secret,
        'region' => 'us-east-1',
        ));
         */

        /**
         * init values
         */
        $this->sender_email = 'sender@example.com';
        $this->configuration_set = 'ConfigSet';
        $this->char_set = 'UTF-8';
    }

    function SetTo(array $TO)
    {
        $this->recipient_emails = ['recipient1@example.com', 'recipient2@example.com'];
    }

    function SetSubject()
    {
        $this->subject = 'Amazon SES test (AWS SDK for PHP)';
    }

    function SetBody()
    {
        $this->plaintext_body = 'This email was sent with Amazon SES using the AWS SDK for PHP.';
        $this->html_body = '<h1>AWS Amazon Simple Email Service Test Email</h1>'.
        '<p>This email was sent with <a href="https://aws.amazon.com/ses/">'.
        'Amazon SES</a> using the <a href="https://aws.amazon.com/sdk-for-php/">'.
        'AWS SDK for PHP</a>.</p>';

    }

    function Send()
    {
        try {
            $result = $this->SesClient->sendEmail([
                'Destination' => [
                    'ToAddresses' => $this->recipient_emails,
                ],
                'ReplyToAddresses' => [$this->sender_email],
                'Source' => $this->sender_email,
                'Message' => [
                    'Body' => [
                        'Html' => [
                            'Charset' => $this->char_set,
                            'Data' => $this->html_body,
                        ],
                        'Text' => [
                            'Charset' => $this->char_set,
                            'Data' => $this->plaintext_body,
                        ],
                    ],
                    'Subject' => [
                        'Charset' => $this->char_set,
                        'Data' => $this->subject,
                    ],
                ],
                // If you aren't using a configuration set, comment or delete the
                // following line
                ##'ConfigurationSetName' => $this->configuration_set,
            ]);
            $messageId = $result['MessageId'];
            return ("Email sent! Message ID: $messageId");
        } catch (AwsException $e) {
            // output error message if fails
            return ("The email was not sent. Error message: ".$e->getAwsErrorMessage() . ' ' . $e->getMessage());
        }
    }
}