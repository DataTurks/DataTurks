package dataturks.response;

import dataturks.DTypes;

public class ProjectStats {
    public String id;

    private ProjectDetails details;

    private POSTaggingStats posTaggingStats;
    private TextSummarizationStats textSummarizationStats;
    private TextClassificationStats textClassificationStats;
    private ImageClassificationStats imageClassificationStats;
    private ImageClassificationStats imageBoundingBoxStats;

    private ImageClassificationStats videoBoundingBoxStats;
    private ImageClassificationStats videoClassificationStats;

    private POSTaggingStats documentTaggingStats;

    public ProjectStats() {

    }
    public ProjectStats(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ProjectDetails getDetails() {
        return details;
    }

    public void setDetails(ProjectDetails details) {
        this.details = details;
    }

    public POSTaggingStats getPosTaggingStats() {
        return posTaggingStats;
    }

    public void setPosTaggingStats(POSTaggingStats posTaggingStats) {
        this.posTaggingStats = posTaggingStats;
    }

    public POSTaggingStats getDocumentTaggingStats() {
        return documentTaggingStats;
    }

    public void setDocumentTaggingStats(POSTaggingStats documentTaggingStats) {
        this.documentTaggingStats = documentTaggingStats;
    }

    public TextSummarizationStats getTextSummarizationStats() {
        return textSummarizationStats;
    }

    public void setTextSummarizationStats(TextSummarizationStats textSummarizationStats) {
        this.textSummarizationStats = textSummarizationStats;
    }

    public TextClassificationStats getTextClassificationStats() {
        return textClassificationStats;
    }

    public void setTextClassificationStats(TextClassificationStats textClassificationStats) {
        this.textClassificationStats = textClassificationStats;
    }

    public ImageClassificationStats getImageClassificationStats() {
        return imageClassificationStats;
    }

    public void setImageClassificationStats(ImageClassificationStats imageClassificationStats) {
        this.imageClassificationStats = imageClassificationStats;
    }

    public ImageClassificationStats getImageBoundingBoxStats() {
        return imageBoundingBoxStats;
    }

    public void setImageBoundingBoxStats(ImageClassificationStats imageBoundingBoxStats) {
        this.imageBoundingBoxStats = imageBoundingBoxStats;
    }

    public ImageClassificationStats getVideoBoundingBoxStats() {
        return videoBoundingBoxStats;
    }

    public void setVideoBoundingBoxStats(ImageClassificationStats videoBoundingBoxStats) {
        this.videoBoundingBoxStats = videoBoundingBoxStats;
    }

    public ImageClassificationStats getVideoClassificationStats() {
        return videoClassificationStats;
    }

    public void setVideoClassificationStats(ImageClassificationStats videoClassificationStats) {
        this.videoClassificationStats = videoClassificationStats;
    }
}
