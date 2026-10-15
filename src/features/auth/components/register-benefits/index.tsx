import { registerBenefits } from "@/features/auth/constants/registerBenefits";

export function RegisterBenefits() {
  return (
    <ul className="mt-2 flex flex-col gap-3">
      {registerBenefits.map((benefit) => (
        <li key={benefit} className="flex items-center gap-3 text-base">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="flex-none text-secondary"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {benefit}
        </li>
      ))}
    </ul>
  );
}
