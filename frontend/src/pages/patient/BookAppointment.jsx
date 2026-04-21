import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Loader2, Stethoscope } from "lucide-react";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/doctor/list");
        setDoctors(r.data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      const iso = date.toISOString().split("T")[0];
      api
        .get(`/appointments/slots/${selectedDoctor.id}?date=${iso}`)
        .then((r) => setSlots(r.data.available_slots || []))
        .catch(() => setSlots([]));
      setSelectedSlot(null);
    }
  }, [selectedDoctor, date]);

  const book = async () => {
    if (!selectedDoctor || !date || !selectedSlot) return;
    setBusy(true);
    try {
      await api.post("/appointments/", {
        doctor_profile_id: selectedDoctor.id,
        date: date.toISOString().split("T")[0],
        time_slot: selectedSlot,
      });
      toast.success("Appointment booked");
      setSelectedDoctor(null);
      setDate(null);
      setSelectedSlot(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not book");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10" data-testid="book-appointment-page">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Care access</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Book an appointment</h1>
      </div>

      {doctors.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <Stethoscope className="h-6 w-6 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground mt-4">
            No approved doctors are available yet. Please check back later.
          </p>
        </div>
      )}

      {doctors.length > 0 && (
        <>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              1. Choose a doctor
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoctor(d)}
                  className={`text-left rounded-lg border p-5 card-hover ${
                    selectedDoctor?.id === d.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                  data-testid={`doctor-card-${d.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={d.image_url} alt={d.name} />
                      <AvatarFallback>{d.name?.[0] || "D"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialization}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {d.experience} yrs · {d.qualification}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedDoctor && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  2. Pick a date
                </div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  data-testid="booking-calendar"
                />
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  3. Pick a time
                </div>
                {!date && (
                  <div className="text-sm text-muted-foreground">Select a date first.</div>
                )}
                {date && slots.length === 0 && (
                  <div className="text-sm text-muted-foreground">No slots available on this date.</div>
                )}
                {date && slots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSlot(s)}
                        className={`px-3 py-2 rounded-md border text-sm transition-all ${
                          selectedSlot === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                        data-testid={`slot-${s.replace(/\s+/g,'-').replace(':','')}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {selectedDoctor && date && selectedSlot && (
                  <Button
                    onClick={book}
                    size="lg"
                    className="w-full mt-6 rounded-full"
                    disabled={busy}
                    data-testid="confirm-booking-btn"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <><CalendarDays className="h-4 w-4 mr-2" /> Confirm booking</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
