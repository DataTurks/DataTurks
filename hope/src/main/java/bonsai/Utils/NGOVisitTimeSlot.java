package bonsai.Utils;

/**
 * Created by mohan on 5/6/17.
 */
public class NGOVisitTimeSlot {

    private int slotStartHour;
    private int slotEndtHour;
    private String displayString;

    public NGOVisitTimeSlot() {
    }

    public NGOVisitTimeSlot(int slotStartHour, int slotEndtHour, String displayString) {
        this.slotStartHour = slotStartHour;
        this.slotEndtHour = slotEndtHour;
        this.displayString = displayString;
    }

    public int getSlotStartHour() {
        return slotStartHour;
    }

    public void setSlotStartHour(int slotStartHour) {
        this.slotStartHour = slotStartHour;
    }

    public int getSlotEndtHour() {
        return slotEndtHour;
    }

    public void setSlotEndtHour(int slotEndtHour) {
        this.slotEndtHour = slotEndtHour;
    }

    public String getDisplayString() {
        return displayString;
    }

    public void setDisplayString(String displayString) {
        this.displayString = displayString;
    }
}
