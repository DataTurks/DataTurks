package dataturks.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class POSTaggingStats {
    private long totalWords; //as present in the data.
    private long totalUniqWords;

    private long totalWordsWithLabels; //as present in the tagged data.
    private long totalUniqWordsWithLabels;

    private List<WordStats> mostFrequentWords;
    private List<WordStats> leastFrequentWords;

    private Map<String, LabelStat> perLabelStat;

    public POSTaggingStats() {
        this.perLabelStat = new HashMap<>();
    }

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

    public void addLabelDetails(String label, long count, long uniqWords) {
        LabelStat labelStat = new LabelStat(count, uniqWords);
        this.perLabelStat.put(label, labelStat);
    }

    public Map<String, LabelStat> getPerLabelStat() {
        return perLabelStat;
    }

    public void setPerLabelStat(Map<String, LabelStat> perLabelStat) {
        this.perLabelStat = perLabelStat;
    }


    public long getTotalWordsWithLabels() {
        return totalWordsWithLabels;
    }

    public void setTotalWordsWithLabels(long totalWordsWithLabels) {
        this.totalWordsWithLabels = totalWordsWithLabels;
    }

    public long getTotalUniqWordsWithLabels() {
        return totalUniqWordsWithLabels;
    }

    public void setTotalUniqWordsWithLabels(long totalUniqWordsWithLabels) {
        this.totalUniqWordsWithLabels = totalUniqWordsWithLabels;
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

    public static class LabelStat {
        private long count; //total number of times this label is applied.
        private long numUniqWords; //number of uniq words labeled with this.

        public LabelStat(){}
        public LabelStat(long count, long numUniqWords) {
            this.count = count;
            this.numUniqWords = numUniqWords;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public long getNumUniqWords() {
            return numUniqWords;
        }

        public void setNumUniqWords(long numUniqWords) {
            this.numUniqWords = numUniqWords;
        }
    }
}
