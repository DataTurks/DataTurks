package dataturks.response;

public class UploadResponse {
    long totalUploadSizeInBytes;
    long numHitsCreated;
    long numHitResultsCreated;
    long numHitsIgnored;

    public UploadResponse(){}

    public void incrementHits() {
        this.numHitsCreated++;
    }

    public void incrementHitResults() {
        this.numHitResultsCreated++;
    }

    public void incrementIgnored() {
        this.numHitsIgnored++;
    }

    public void incrementSize(long bytes) {
        this.totalUploadSizeInBytes+=bytes;
    }

    public long getTotalUploadSizeInBytes() {
        return totalUploadSizeInBytes;
    }

    public void setTotalUploadSizeInBytes(long totalUploadSizeInBytes) {
        this.totalUploadSizeInBytes = totalUploadSizeInBytes;
    }

    public long getNumHitsCreated() {
        return numHitsCreated;
    }

    public void setNumHitsCreated(long numHitsCreated) {
        this.numHitsCreated = numHitsCreated;
    }

    public long getNumHitResultsCreated() {
        return numHitResultsCreated;
    }

    public void setNumHitResultsCreated(long numHitResultsCreated) {
        this.numHitResultsCreated = numHitResultsCreated;
    }

    public long getNumHitsIgnored() {
        return numHitsIgnored;
    }

    public void setNumHitsIgnored(long numHitsIgnored) {
        this.numHitsIgnored = numHitsIgnored;
    }
}
