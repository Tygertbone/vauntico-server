const CTAButton = ({ label, onClick }) => {
  console.log('CTAButton label:', label);

  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
    >
      {label}
    </button>
  );
};

export default CTAButton;
