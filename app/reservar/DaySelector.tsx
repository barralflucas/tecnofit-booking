"use client";

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface Props {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
}

export default function DaySelector({ selectedDate, onChange }: Props) {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const isSame = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();

  return (
    <div>
      <p
        style={{
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9f9f9f",
          marginBottom: "12px",
        }}
      >
        Elegí el día
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {days.map((day) => {
          const selected = selectedDate ? isSame(day, selectedDate) : false;
          const isToday = isSame(day, today);
          const isSunday = day.getDay() === 0;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !isSunday && onChange(day)}
              disabled={isSunday}
              title={isSunday ? "No hay turnos los domingos" : undefined}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                width: "68px",
                height: "88px",
                borderRadius: "18px",
                border: selected
                  ? "1px solid #ffffff"
                  : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: selected
                  ? "#ffffff"
                  : isSunday
                  ? "rgba(255,255,255,0.01)"
                  : "rgba(255,255,255,0.04)",
                color: selected ? "#111111" : isSunday ? "#3d3d3d" : "#f5f5f5",
                cursor: isSunday ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: selected ? "#777" : isSunday ? "#3d3d3d" : "#9f9f9f",
                }}
              >
                {DAYS_ES[day.getDay()]}
              </span>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {day.getDate()}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: selected ? "#777" : isSunday ? "#3d3d3d" : "#9f9f9f",
                }}
              >
                {MONTHS_ES[day.getMonth()]}
              </span>
              {isToday && !selected && (
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    marginTop: "72px",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
