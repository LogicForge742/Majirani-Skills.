import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

const SIGNALS = [
  { key: "profilePhoto", label: "Profile photo uploaded", weight: 20 },
  { key: "verified", label: "Identity verified", weight: 30 },
  { key: "skillCategory", label: "Skill category set", weight: 20 },
  { key: "location", label: "Location added", weight: 10 },
  { key: "bio", label: "Bio written", weight: 10 },
  { key: "services", label: "Service listed", weight: 10 },
];

/**
 * Profile Completion progress bar with a signal checklist.
 *
 * @param {{
 *   completion: number,
 *   profilePhoto?: string|null,
 *   verified?: boolean,
 *   skillCategory?: object|null,
 *   county?: string|null,
 *   town?: string|null,
 *   bio?: string|null,
 *   hasServices?: boolean
 * }} props
 */
const ProfileCompletion = ({
  completion = 0,
  profilePhoto,
  verified,
  skillCategory,
  county,
  town,
  bio,
  hasServices,
}) => {
  const signalActive = {
    profilePhoto: !!profilePhoto,
    verified: !!verified,
    skillCategory: !!skillCategory,
    location: !!(county || town),
    bio: !!bio,
    services: !!hasServices,
  };

  const colour =
    completion >= 80
      ? "text-emerald-600"
      : completion >= 50
      ? "text-amber-600"
      : "text-rose-500";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-sm">Profile Completion</h3>
        <span className={`text-2xl font-black ${colour}`}>{completion}%</span>
      </div>

      {/* Animated progress bar */}
      <Progress value={completion} className="h-2.5 rounded-full" />

      {/* Signal checklist */}
      <ul className="space-y-2.5 pt-1">
        {SIGNALS.map((signal) => {
          const done = signalActive[signal.key];
          return (
            <li key={signal.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2.5">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className={done ? "text-foreground" : "text-muted-foreground"}>
                  {signal.label}
                </span>
              </span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  done ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                +{signal.weight}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProfileCompletion;
