const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: "6+ characters", valid: password.length >= 6 },
    { label: "Special char", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Uppercase", valid: /[A-Z]/.test(password) }
  ];

  const allValid = requirements.every(r => r.valid);

  return (
    <div className="mt-2 text-sm">
      <p className={`${allValid ? "text-green-600" : "text-gray-500"}`}>
        {allValid ? "✅ Strong password" : "🔒 Must meet the following:"}
      </p>
      {!allValid && (
        <ul className="mt-1 ml-4 list-disc space-y-1">
          {requirements.map((req, idx) => (
            <li
              key={idx}
              className={req.valid ? "text-green-600" : "text-red-600"}
            >
              {req.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordRequirements;