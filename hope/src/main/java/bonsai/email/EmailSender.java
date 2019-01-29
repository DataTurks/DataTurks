package bonsai.email;

import bonsai.Utils.CommonUtils;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.*;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.dropwizard.dao.d.DUsers;
import bonsai.security.FirebaseSignIn;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.*;
import com.restfb.types.ads.Campaign;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

/**
 * Created by mohan on 20/6/17.
 */
public class EmailSender {

    private static final Logger LOG = LoggerFactory.getLogger(EmailSender.class);
    private final static String EMAIl_FORMAT_FOLDER = "./support/emailFormats";
    private final static String EMAIL_AWS_SES_CONFIGURATION_SET_NAME = "firstSet";
    private final static String EMAIL_AWS_SES_MSG_TAG_NAME = "campaign";


    private final static String CAMPAIGN_BONSAI_SIGNUP = "bonsai_signup";
    private final static String CAMPAIGN_BONSAI_PAYMENT = "bonsai_payment";
    private final static String CAMPAIGN_SA_SIGNUP = "sa_signup";
    private final static String CAMPAIGN_SA_BRAND_SIGNUP = "sa_brand_signup";
    private final static String CAMPAIGN_SA_NEW_ASSIGN = "sa_new_assign";
    private final static String CAMPAIGN_SA_FEEDBACK = "sa_feedback";
    private final static String CAMPAIGN_SA_OTHER_UPDATES = "sa_updates";

    private final static String CAMPAIGN_DT_OTHER_UPDATES = "dt_updates";


    private final static String CAMPAIGN_DATATURKS_SIGNUP = "d_signup";
    private final static String CAMPAIGN_DATATURKS_UPDATES = "d_updates";
    public final static String CAMPAIGN_DATATURKS_NEWSLETTER = "d_newsletter";




    //first login format items.
    public final static String USER_NAME = "__USER_NAME__";
    public final static String COUPON_CODE = "__COUPON_CODE__";
    public final static String CAUSE_NAME = "__CAUSE__";
    private final static String CAMPAIGN = "__CAMPAIGN__";
    private final static String BRAND = "__BRAND__";
    private final static String PHONE_NUMBER = "__PHONE_NUMBER___";

    private final static String DOWNLOAD_LINK = "__DOWNLOAD_LINK___";
    private final static String DATASET_TITLE = "__DATASET_TITLE___";

    private final static String REWARD_TITLE = "__REWARD_TITLE___";
    private final static String REDEEMED_POINTS = "__REDEEMED_POINTS___";


    private final static String DATA = "___DATA___";
    private static final String CAMPAIGN_GI_SIGNUP = "gi_new_user_signup";


    //dataturks
    public final static String INVITER_NAME = "__INVITER_NAME__";
    public final static String PROJECT_NAME = "__PROJECT_NAME__";




    public static void sendMail(String from, String to, String subjectText, String bodyText, String htmlBody, String campaignName) {
        if (!DBBasedConfigs.getConfig("dEmailSendingAllowed", Boolean.class, true)) {
            return;
        }

        Destination destination = new Destination().withToAddresses(new String[] { to });
        // Create the subject and body of the message.
        Content subject = new Content().withData(subjectText);
        Body body = new Body();

        if (htmlBody != null) {
            Content content = new Content(htmlBody);
            body = body.withHtml(content);
        }
        else {
            Content textBody = new Content().withData(bodyText);
            body = body.withText(textBody);
        }

        // Create a message with the specified subject and body.
        Message message = new Message().withSubject(subject).withBody(body);

        // Assemble the email.
        SendEmailRequest request = new SendEmailRequest().withSource(from)
                .withDestination(destination).withMessage(message);

        // for reports on opens/clicks etc.
        // Create only when needed as its charged per unique campaign name.
        if (campaignName != null) {
            MessageTag tag = new MessageTag().withName(EMAIL_AWS_SES_MSG_TAG_NAME);
            tag.setValue(campaignName);
            request.withConfigurationSetName(EMAIL_AWS_SES_CONFIGURATION_SET_NAME).withTags(tag);
        }


        try {

            LOG.info("Sending email to: " + to);
            AmazonSimpleEmailService client = AmazonSimpleEmailServiceClientBuilder.standard()
                    .withRegion(Regions.US_WEST_2).build();

            // Send the email.
            client.sendEmail(request);
            LOG.info("Email sent to : " + to);
        } catch (Exception ex) {
            LOG.error("Error sending email : message: " + ex.getMessage());
        }
    }

    public static String getFormat(String formatFileName) {
        try {
            InputStream stream = null;
            //first try the format folder.
            File f = new File(EMAIl_FORMAT_FOLDER + "/" + formatFileName);
            if (f != null && f.exists()) {
                stream = new FileInputStream(f);
            }
            else {
                //read from resources.
                stream = EmailSender.class.getResourceAsStream("/emailFormats/" + formatFileName);
                String str = CommonUtils.readStreamRaw(stream);
                return str;
            }
        }
        catch (Exception e) {
            LOG.error("Error reading " + formatFileName + ", error = " + e.toString());
        }

        return null;
    }

    public static void main(String[] args) {

    }







    public static void sendEventMail(String subject, String content) {
        String from = DBBasedConfigs.getConfig("dtEventsMailsFrom", String.class, "mohan@dataturks.com");
        String to = DBBasedConfigs.getConfig("dtEventsToMail", String.class, "dataturksinfo@gmail.com");
        sendMail(from, to, "NotificationMail: " + subject, content, null, null);

    }

    public static void sendAppEventMail(String subject, String data) {
        String format = getFormat("events.html");
        if (format != null) {
            format = format.replaceFirst(DATA, data);
            String from = "\"Mohan from DT\" <mohan@dataturks.com>";
            sendMail(from, "dataturksinfo@gmail.com", "NotificationMail: " + subject, null, format, null);
        }
    }

    public static void sendDatasetDownloadMail(String email, String userFirstName,
                                               String subject, String datasetDisplayName,
                                               String downloadPath) {
        if (email != null) {
            String fileName = DBBasedConfigs.getConfig("dtDatasetDownloadEmailFormat", String.class, "dtDatasetDownload.html");
            String format = getFormat(fileName);
            if (format != null) {
                //capitalize first letter.
                userFirstName = CommonUtils.capitalizeFirst(userFirstName);
                String name = userFirstName;
                name = name == null ? "Friend" : name;

                if (userFirstName != null) {
                    subject = userFirstName + ", " + subject;
                }
                format = format.replaceFirst(USER_NAME, name);
                format = format.replaceFirst(DATASET_TITLE, datasetDisplayName);
                format = format.replaceFirst(DOWNLOAD_LINK, downloadPath);
                String from = "\"Mohan from Dataturks\" <mohan@dataturks.com>";
                sendMail(from, email, subject, null, format, CAMPAIGN_DT_OTHER_UPDATES);
            }
        }
    }





    //////////////////////// Dataturks annotation emails ////////////////////////////
    public static void sendDataturksUserSignupEmail(DUsers user) {
        String email = user.getEmail();
        String firstName = user.getFirstName();

        if (email != null) {
            String fileName = "d_userSignUp.html";
            String format = getFormat(fileName);
            if (format != null) {
                //capitalize first letter.
                firstName = CommonUtils.capitalizeFirst(firstName);
                String name = firstName;
                name = name == null ? "There" : name;

                String subject = "hey! thanks for signing up for Dataturks.";
                if (firstName != null) {
                    subject = firstName + "! thanks for signing up for Dataturks.";
                }
                format = format.replaceAll(USER_NAME, name);

                String from = "\"Mohan from Dataturks\" <mohan@dataturks.com>";
                sendMail(from, email, subject, null, format, CAMPAIGN_DATATURKS_SIGNUP);
            }
        }

    }


    public static void sendDataturksUserFeedbackEmail(DUsers user) {
        String email = user.getEmail();
        String firstName = user.getFirstName();

        if (email != null) {
            String fileName = "d_userFeedback_plain.txt";
            String format = getFormat(fileName);
            if (format != null) {
                //capitalize first letter.
                firstName = CommonUtils.capitalizeFirst(firstName);
                String name = firstName;
                name = name == null ? "There" : name;

                String subject = "hey! is there something we could have done better?";
                if (firstName != null) {
                    subject = firstName + ", is there something we could have done better?";
                }
                format = format.replaceAll(USER_NAME, name);

                String from = "\"Mohan Gupta\" <mohan@dataturks.com>";
                sendMail(from, email, subject, null, format, CAMPAIGN_DATATURKS_UPDATES);
            }
        }

    }

    //when an existing user is added to a project
    public static void sendDataturksUserAddedToProject(DUsers inviter, DUsers user, DProjects project) {
        String email = user.getEmail();
        String firstName = user.getFirstName();
        String inviterName = CommonUtils.capitalizeFirst(inviter.getFirstName());
        String projectName = project.getName();

        if (email != null) {
            String fileName = "d_projectInvite.html";
            String format = getFormat(fileName);
            if (format != null) {
                //capitalize first letter.
                firstName = CommonUtils.capitalizeFirst(firstName);
                String name = firstName;
                name = name == null ? "There" : name;

                String subject = inviterName + " has added you to the project " + projectName + ".";

                format = format.replaceAll(USER_NAME, name);
                format = format.replaceAll(INVITER_NAME, inviterName);
                format = format.replaceAll(PROJECT_NAME, projectName);

                String from = "\"Mohan from Dataturks\" <mohan@dataturks.com>";
                sendMail(from, email, subject, null, format, CAMPAIGN_DATATURKS_UPDATES);
            }
        }

    }

    //when an email is added to a project. Ask user to signup and be part of the project.
    public static void sendDataturksEmailAddedToProject(DUsers inviter, String userEmail, DProjects project) {
        String email = userEmail;
        String firstName = null;
        String inviterName = CommonUtils.capitalizeFirst(inviter.getFirstName());
        String projectName = project.getName();

        if (email != null) {
            String fileName = "d_projectInviteNewUser.html";
            String format = getFormat(fileName);
            if (format != null) {
                //capitalize first letter.
                firstName = CommonUtils.capitalizeFirst(firstName);
                String name = firstName;
                name = name == null ? "There" : name;

                String subject = inviterName + " has added you to the project " + projectName + ".";

                format = format.replaceAll(USER_NAME, name);
                format = format.replaceAll(INVITER_NAME, inviterName);
                format = format.replaceAll(PROJECT_NAME, projectName);

                String from = "\"Mohan from Dataturks\" <mohan@dataturks.com>";
                sendMail(from, email, subject, null, format, CAMPAIGN_DATATURKS_UPDATES);
            }
        }
    }
}
