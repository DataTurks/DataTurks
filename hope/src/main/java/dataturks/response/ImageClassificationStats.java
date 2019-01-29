package dataturks.response;

import java.util.ArrayList;
import java.util.List;

public class ImageClassificationStats {

    List<LabelStat> laeblStats = new ArrayList<>();

    public List<LabelStat> getLaeblStats() {
        return laeblStats;
    }

    public void setLaeblStats(List<LabelStat> laeblStats) {
        this.laeblStats = laeblStats;
    }

    public static class LabelStat {
        String label;
        int count;

        public LabelStat(){

        }

        public LabelStat(String label) {
            this.label = label;
        }

        public LabelStat(String label, int count){
            this(label);
            this.count = count;
        }



        public void incrementCount() {
            this.count++;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }
}
