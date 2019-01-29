package dataturks;

public class DTypes {
    public enum User_Roles {
        ADMIN,
        MEMBER,
    }
    //who can contributor etc.
    public enum Project_Access_Type {
        PUBLIC,
        RESTRICTED,
        PRIVATE
    }

    //who is it visible to?
    public enum Project_Visibility_Type {
        PUBLIC,
        PRIVATE
    }

    public enum Project_Status {
        NONE,
        DELETED,
        AUTOUPDATED,
    }

    public enum Project_Task_Type {
        TEXT_CLASSIFICATION,
        TEXT_SUMMARIZATION,
        POS_TAGGING,
        POS_TAGGING_GENERIC,
        TEXT_MODERATION,
        DOCUMENT_ANNOTATION,
        IMAGE_CLASSIFICATION,
        IMAGE_BOUNDING_BOX,
        IMAGE_POLYGON_BOUNDING_BOX,
        IMAGE_POLYGON_BOUNDING_BOX_V2,
        VIDEO_CLASSIFICATION,
        VIDEO_BOUNDING_BOX
    }

    public enum Project_User_Role {
        OWNER,
        CONTRIBUTOR,
    }

    public enum File_Type {
        TEXT,
        IMAGE,
        VIDEO,
        ZIP,
        TAR,
        GZIP,
        DOC,
        DOCX,
        PDF,
        OTHERS
    }

    public enum File_Upload_Format {
        UNSPECIFIED,
        PRE_TAGGED_JSON,
        PRE_TAGGED_TSV,
        URL_FILE
    }

    public enum File_Download_Type {
        ALL,
        DONE,
    }

    public enum File_Download_Format {
        ANY,
        JSON,
        STANFORD_NER
    }


    public enum APIKey_Status {
        NONE,
        DELETED,
    }

    public enum HIT_Evaluation_Type {
        NONE,
        CORRECT,
        INCORRECT,
    }

    public enum HIT_ORDER_Type {
        NONE,
        RANDOM,
        NEW_FIRST,
        OLD_FIRST
    }
}
