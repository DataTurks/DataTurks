package dataturks.response;

import java.util.List;
import java.util.Map;

public class TextSummarizationStats {
    private long totalWords; //as present in the data.
    private long totalUniqWords;

    private List<WordStats> mostFrequentWords;
    private List<WordStats> leastFrequentWords;

    //the length in words of input /summary.
    private long avrWordsInHits;
    private long avrWordsInHitResults;

    //words which were removed from input to form the summary.
    private List<WordStats> mostFrequentExcludedWords;


    public long getTotalWords() {
        return totalWords;
    }

    public void setTotalWords(long totalWords) {
        this.totalWords = totalWords;
    }

    public long getTotalUniqWords() {
        return totalUniqWords;
    }

    public void setTotalUniqWords(long totalUniqWords) {
        this.totalUniqWords = totalUniqWords;
    }

    public List<WordStats> getMostFrequentWords() {
        return mostFrequentWords;
    }

    public void setMostFrequentWords(List<WordStats> mostFrequentWords) {
        this.mostFrequentWords = mostFrequentWords;
    }

    public List<WordStats> getLeastFrequentWords() {
        return leastFrequentWords;
    }

    public void setLeastFrequentWords(List<WordStats> leastFrequentWords) {
        this.leastFrequentWords = leastFrequentWords;
    }

    public long getAvrWordsInHits() {
        return avrWordsInHits;
    }

    public void setAvrWordsInHits(long avrWordsInHits) {
        this.avrWordsInHits = avrWordsInHits;
    }

    public long getAvrWordsInHitResults() {
        return avrWordsInHitResults;
    }

    public void setAvrWordsInHitResults(long avrWordsInHitResults) {
        this.avrWordsInHitResults = avrWordsInHitResults;
    }

    public List<WordStats> getMostFrequentExcludedWords() {
        return mostFrequentExcludedWords;
    }

    public void setMostFrequentExcludedWords(List<WordStats> mostFrequentExcludedWords) {
        this.mostFrequentExcludedWords = mostFrequentExcludedWords;
    }
}
