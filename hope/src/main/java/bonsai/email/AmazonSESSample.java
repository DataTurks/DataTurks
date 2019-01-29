package bonsai.email;


import java.io.IOException;

import bonsai.Utils.CommonUtils;
import com.amazonaws.services.simpleemail.*;
import com.amazonaws.services.simpleemail.model.*;
import com.amazonaws.regions.*;

public class AmazonSESSample {

    // Replace with your "From" address. This address must be verified.
    static final String FROM = "mohan@bonsaiapp.in";

    // Replace with a "To" address. If your account is still in the
    // sandbox, this address must be verified.
    static final String TO = "mohangupta13@gmail.com";

    static final String BODY = "This email was sent through Amazon SES using the AWS SDK for Java.";
    static final String SUBJECT = "Amazon SES test (AWS SDK for Java)";
    static final String HTML = "<!doctype html>\n" +
            "<html>\n" +
            "  <head>\n" +
            "    <meta name=\"viewport\" content=\"width=device-width\" />\n" +
            "    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n" +
            "    <title>Simple Transactional Email</title>\n" +
            "    <style>\n" +
            "      /* -------------------------------------\n" +
            "          GLOBAL RESETS\n" +
            "      ------------------------------------- */\n" +
            "      img {\n" +
            "        border: none;\n" +
            "        -ms-interpolation-mode: bicubic;\n" +
            "        max-width: 100%; }\n" +
            "\n" +
            "      body {\n" +
            "        background-color: #f6f6f6;\n" +
            "        font-family: sans-serif;\n" +
            "        -webkit-font-smoothing: antialiased;\n" +
            "        font-size: 14px;\n" +
            "        line-height: 1.4;\n" +
            "        margin: 0;\n" +
            "        padding: 0; \n" +
            "        -ms-text-size-adjust: 100%;\n" +
            "        -webkit-text-size-adjust: 100%; }\n" +
            "\n" +
            "      table {\n" +
            "        border-collapse: separate;\n" +
            "        mso-table-lspace: 0pt;\n" +
            "        mso-table-rspace: 0pt;\n" +
            "        width: 100%; }\n" +
            "        table td {\n" +
            "          font-family: sans-serif;\n" +
            "          font-size: 14px;\n" +
            "          vertical-align: top; }\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          BODY & CONTAINER\n" +
            "      ------------------------------------- */\n" +
            "\n" +
            "      .body {\n" +
            "        background-color: #f6f6f6;\n" +
            "        width: 100%; }\n" +
            "\n" +
            "      /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */\n" +
            "      .container {\n" +
            "        display: block;\n" +
            "        Margin: 0 auto !important;\n" +
            "        /* makes it centered */\n" +
            "        max-width: 580px;\n" +
            "        padding: 10px;\n" +
            "        width: 580px; }\n" +
            "\n" +
            "      /* This should also be a block element, so that it will fill 100% of the .container */\n" +
            "      .content {\n" +
            "        box-sizing: border-box;\n" +
            "        display: block;\n" +
            "        Margin: 0 auto;\n" +
            "        max-width: 580px;\n" +
            "        padding: 10px; }\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          HEADER, FOOTER, MAIN\n" +
            "      ------------------------------------- */\n" +
            "      .main {\n" +
            "        background: #fff;\n" +
            "        border-radius: 3px;\n" +
            "        width: 100%; }\n" +
            "\n" +
            "      .wrapper {\n" +
            "        box-sizing: border-box;\n" +
            "        padding: 20px; }\n" +
            "\n" +
            "      .footer {\n" +
            "        clear: both;\n" +
            "        padding-top: 10px;\n" +
            "        text-align: center;\n" +
            "        width: 100%; }\n" +
            "        .footer td,\n" +
            "        .footer p,\n" +
            "        .footer span,\n" +
            "        .footer a {\n" +
            "          color: #999999;\n" +
            "          font-size: 12px;\n" +
            "          text-align: center; }\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          TYPOGRAPHY\n" +
            "      ------------------------------------- */\n" +
            "      h1,\n" +
            "      h2,\n" +
            "      h3,\n" +
            "      h4 {\n" +
            "        color: #000000;\n" +
            "        font-family: sans-serif;\n" +
            "        font-weight: 400;\n" +
            "        line-height: 1.4;\n" +
            "        margin: 0;\n" +
            "        Margin-bottom: 30px; }\n" +
            "\n" +
            "      h1 {\n" +
            "        font-size: 35px;\n" +
            "        font-weight: 300;\n" +
            "        text-align: center;\n" +
            "        text-transform: capitalize; }\n" +
            "\n" +
            "      p,\n" +
            "      ul,\n" +
            "      ol {\n" +
            "        font-family: sans-serif;\n" +
            "        font-size: 14px;\n" +
            "        font-weight: normal;\n" +
            "        margin: 0;\n" +
            "        Margin-bottom: 15px; }\n" +
            "        p li,\n" +
            "        ul li,\n" +
            "        ol li {\n" +
            "          list-style-position: inside;\n" +
            "          margin-left: 5px; }\n" +
            "\n" +
            "      a {\n" +
            "        color: #3498db;\n" +
            "        text-decoration: underline; }\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          BUTTONS\n" +
            "      ------------------------------------- */\n" +
            "      .btn {\n" +
            "        box-sizing: border-box;\n" +
            "        width: 100%; }\n" +
            "        .btn > tbody > tr > td {\n" +
            "          padding-bottom: 15px; }\n" +
            "        .btn table {\n" +
            "          width: auto; }\n" +
            "        .btn table td {\n" +
            "          background-color: #ffffff;\n" +
            "          border-radius: 5px;\n" +
            "          text-align: center; }\n" +
            "        .btn a {\n" +
            "          background-color: #ffffff;\n" +
            "          border: solid 1px #3498db;\n" +
            "          border-radius: 5px;\n" +
            "          box-sizing: border-box;\n" +
            "          color: #3498db;\n" +
            "          cursor: pointer;\n" +
            "          display: inline-block;\n" +
            "          font-size: 14px;\n" +
            "          font-weight: bold;\n" +
            "          margin: 0;\n" +
            "          padding: 12px 25px;\n" +
            "          text-decoration: none;\n" +
            "          text-transform: capitalize; }\n" +
            "\n" +
            "      .btn-primary table td {\n" +
            "        background-color: #3498db; }\n" +
            "\n" +
            "      .btn-primary a {\n" +
            "        background-color: #3498db;\n" +
            "        border-color: #3498db;\n" +
            "        color: #ffffff; }\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          OTHER STYLES THAT MIGHT BE USEFUL\n" +
            "      ------------------------------------- */\n" +
            "      .last {\n" +
            "        margin-bottom: 0; }\n" +
            "\n" +
            "      .first {\n" +
            "        margin-top: 0; }\n" +
            "\n" +
            "      .align-center {\n" +
            "        text-align: center; }\n" +
            "\n" +
            "      .align-right {\n" +
            "        text-align: right; }\n" +
            "\n" +
            "      .align-left {\n" +
            "        text-align: left; }\n" +
            "\n" +
            "      .clear {\n" +
            "        clear: both; }\n" +
            "\n" +
            "      .mt0 {\n" +
            "        margin-top: 0; }\n" +
            "\n" +
            "      .mb0 {\n" +
            "        margin-bottom: 0; }\n" +
            "\n" +
            "      .preheader {\n" +
            "        color: transparent;\n" +
            "        display: none;\n" +
            "        height: 0;\n" +
            "        max-height: 0;\n" +
            "        max-width: 0;\n" +
            "        opacity: 0;\n" +
            "        overflow: hidden;\n" +
            "        mso-hide: all;\n" +
            "        visibility: hidden;\n" +
            "        width: 0; }\n" +
            "\n" +
            "      .powered-by a {\n" +
            "        text-decoration: none; }\n" +
            "\n" +
            "      hr {\n" +
            "        border: 0;\n" +
            "        border-bottom: 1px solid #f6f6f6;\n" +
            "        Margin: 20px 0; }\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          RESPONSIVE AND MOBILE FRIENDLY STYLES\n" +
            "      ------------------------------------- */\n" +
            "      @media only screen and (max-width: 620px) {\n" +
            "        table[class=body] h1 {\n" +
            "          font-size: 28px !important;\n" +
            "          margin-bottom: 10px !important; }\n" +
            "        table[class=body] p,\n" +
            "        table[class=body] ul,\n" +
            "        table[class=body] ol,\n" +
            "        table[class=body] td,\n" +
            "        table[class=body] span,\n" +
            "        table[class=body] a {\n" +
            "          font-size: 16px !important; }\n" +
            "        table[class=body] .wrapper,\n" +
            "        table[class=body] .article {\n" +
            "          padding: 10px !important; }\n" +
            "        table[class=body] .content {\n" +
            "          padding: 0 !important; }\n" +
            "        table[class=body] .container {\n" +
            "          padding: 0 !important;\n" +
            "          width: 100% !important; }\n" +
            "        table[class=body] .main {\n" +
            "          border-left-width: 0 !important;\n" +
            "          border-radius: 0 !important;\n" +
            "          border-right-width: 0 !important; }\n" +
            "        table[class=body] .btn table {\n" +
            "          width: 100% !important; }\n" +
            "        table[class=body] .btn a {\n" +
            "          width: 100% !important; }\n" +
            "        table[class=body] .img-responsive {\n" +
            "          height: auto !important;\n" +
            "          max-width: 100% !important;\n" +
            "          width: auto !important; }}\n" +
            "\n" +
            "      /* -------------------------------------\n" +
            "          PRESERVE THESE STYLES IN THE HEAD\n" +
            "      ------------------------------------- */\n" +
            "      @media all {\n" +
            "        .ExternalClass {\n" +
            "          width: 100%; }\n" +
            "        .ExternalClass,\n" +
            "        .ExternalClass p,\n" +
            "        .ExternalClass span,\n" +
            "        .ExternalClass font,\n" +
            "        .ExternalClass td,\n" +
            "        .ExternalClass div {\n" +
            "          line-height: 100%; }\n" +
            "        .apple-link a {\n" +
            "          color: inherit !important;\n" +
            "          font-family: inherit !important;\n" +
            "          font-size: inherit !important;\n" +
            "          font-weight: inherit !important;\n" +
            "          line-height: inherit !important;\n" +
            "          text-decoration: none !important; } \n" +
            "        .btn-primary table td:hover {\n" +
            "          background-color: #34495e !important; }\n" +
            "        .btn-primary a:hover {\n" +
            "          background-color: #34495e !important;\n" +
            "          border-color: #34495e !important; } }\n" +
            "\n" +
            "    </style>\n" +
            "  </head>\n" +
            "  <body class=\"\">\n" +
            "    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"body\">\n" +
            "      <tr>\n" +
            "        <td>&nbsp;</td>\n" +
            "        <td class=\"container\">\n" +
            "          <div class=\"content\">\n" +
            "\n" +
            "            <!-- START CENTERED WHITE CONTAINER -->\n" +
            "            <span class=\"preheader\">This is preheader text. Some clients will show this text as a preview.</span>\n" +
            "            <table class=\"main\">\n" +
            "\n" +
            "              <!-- START MAIN CONTENT AREA -->\n" +
            "              <tr>\n" +
            "                <td class=\"wrapper\">\n" +
            "                  <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n" +
            "                    <tr>\n" +
            "                      <td>\n" +
            "                        <p>Hi there,</p>\n" +
            "                        <p>Sometimes you just want to send a simple HTML email with a simple design and clear call to action. This is it.</p>\n" +
            "                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"btn btn-primary\">\n" +
            "                          <tbody>\n" +
            "                            <tr>\n" +
            "                              <td align=\"left\">\n" +
            "                                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n" +
            "                                  <tbody>\n" +
            "                                    <tr>\n" +
            "                                      <td> <a href=\"http://htmlemail.io\" target=\"_blank\">Call To Action</a> </td>\n" +
            "                                    </tr>\n" +
            "                                  </tbody>\n" +
            "                                </table>\n" +
            "                              </td>\n" +
            "                            </tr>\n" +
            "                          </tbody>\n" +
            "                        </table>\n" +
            "                        <p>This is a really simple email template. Its sole purpose is to get the recipient to click the button with no distractions.</p>\n" +
            "                        <p>Good luck! Hope it works.</p>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            "                  </table>\n" +
            "                </td>\n" +
            "              </tr>\n" +
            "\n" +
            "            <!-- END MAIN CONTENT AREA -->\n" +
            "            </table>\n" +
            "\n" +
            "            <!-- START FOOTER -->\n" +
            "            <div class=\"footer\">\n" +
            "              <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n" +
            "                <tr>\n" +
            "                  <td class=\"content-block\">\n" +
            "                    <span class=\"apple-link\">Company Inc, 3 Abbey Road, San Francisco CA 94102</span>\n" +
            "                    <br> Don't like these emails? <a href=\"http://i.imgur.com/CScmqnj.gif\">Unsubscribe</a>.\n" +
            "                  </td>\n" +
            "                </tr>\n" +
            "                <tr>\n" +
            "                  <td class=\"content-block powered-by\">\n" +
            "                    Powered by <a href=\"http://htmlemail.io\">HTMLemail</a>.\n" +
            "                  </td>\n" +
            "                </tr>\n" +
            "              </table>\n" +
            "            </div>\n" +
            "            <!-- END FOOTER -->\n" +
            "            \n" +
            "          <!-- END CENTERED WHITE CONTAINER -->\n" +
            "          </div>\n" +
            "        </td>\n" +
            "        <td>&nbsp;</td>\n" +
            "      </tr>\n" +
            "    </table>\n" +
            "  </body>\n" +
            "</html>";

    public static void main(String[] args) throws IOException {

        // Construct an object to contain the recipient address.
        Destination destination = new Destination().withToAddresses(new String[] { TO });

        // Create the subject and body of the message.
        Content subject = new Content().withData(SUBJECT);
        Content textBody = new Content().withData(BODY);
        Body body = new Body().withText(textBody);

        //open file and read content.
        String format = CommonUtils.readStream(CommonUtils.class.getResourceAsStream("/emailFormats/firstLogin.html"));
        if (format != null) {
            format = format.replaceFirst("__USER_NAME__", "mohan");
            Content content = new Content(format);
            body.withHtml(content);
        }

        // Create a message with the specified subject and body.
        Message message = new Message().withSubject(subject).withBody(body);

        // Assemble the email.
        SendEmailRequest request = new SendEmailRequest().withSource(FROM)
                .withDestination(destination).withMessage(message);



        try {
            System.out.println(
                    "Attempting to send an email through Amazon SES using the AWS SDK for Java.");

            // Instantiate an Amazon SES client, which will make the service
            // call.
            //
            // The service call requires your AWS credentials. This code
            // assumes that you are using the AWS Toolkit for Eclipse.
            // Further, it assumes that you specified your AWS
            // credentials in the AWS Preferences window in Eclipse.
            //
            // If you are using a different IDE, you can specify your
            // credentials as environment variables. The credential
            // provider chain looks for your AWS credentials in the
            // environment variables AWS_ACCESS_KEY_ID and
            // AWS_SECRET_ACCESS_KEY. For more information, see
            // http://docs.aws.amazon.com/ses/latest/DeveloperGuide/credentials.html
            //
            // When you instantiate the client, you can also specify the AWS
            // Region of the Amazon SES endpoint. Note that your sandbox
            // status, sending limits, and Amazon SES identity-related settings
            // are specific to a given AWS Region, so be sure to select an
            // AWS Region in which you set up Amazon SES. This example uses the
            // US West (Oregon) Region. For a complete list of AWS Regions, see
            // http://docs.aws.amazon.com/ses/latest/DeveloperGuide/regions.html
            AmazonSimpleEmailService client = AmazonSimpleEmailServiceClientBuilder.standard()
                    .withRegion(Regions.US_WEST_2).build();

            // Send the email.
            client.sendEmail(request);
            System.out.println("Email sent!");
        } catch (Exception ex) {
            System.out.println("The email was not sent.");
            System.out.println("Error message: " + ex.getMessage());
        }
    }
}