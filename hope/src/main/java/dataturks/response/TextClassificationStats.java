package dataturks.response;

import java.util.List;
import java.util.Map;

public class TextClassificationStats {

    private long totalWords; //as present in the data.
    private long totalUniqWords;

    private List<WordStats> mostFrequentWords;
    private List<WordStats> leastFrequentWords;

    private Map<String, ClassificationLabelStat> labelCounts;


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

    public Map<String, ClassificationLabelStat> getLabelCounts() {
        return labelCounts;
    }

    public void setLabelCounts(Map<String, ClassificationLabelStat> labelCounts) {
        this.labelCounts = labelCounts;
    }

    public static class ClassificationLabelStat {
        private long count; //total number of times this label is applied.
        private long avgWords; //avr number of words in this class's items.

        private long totalWords; //all words in this class.

        public ClassificationLabelStat(){}
        public ClassificationLabelStat(long count) {
            this.count = count;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public void incrementCount() { this.count ++;}

        public void addWordLength(long len) {
            this.totalWords += len;
        }

    }

}
