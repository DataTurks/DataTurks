package dataturks.response;

import java.util.Objects;

public class WordStats {

    private String phrase;
    private long count;

    public WordStats(){}

    public WordStats(String phrase){
        this.phrase = phrase;
    }

    public String getPhrase() {
        return phrase;
    }

    public void setPhrase(String phrase) {
        this.phrase = phrase;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public void incrementCount() {
        this.count++;
    }

    public void decrementCount(long count) {
        this.count -= count;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WordStats wordStats = (WordStats) o;
        return Objects.equals(phrase, wordStats.phrase);
    }

    @Override
    public int hashCode() {
        return Objects.hash(phrase);
    }


}
