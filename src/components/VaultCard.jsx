import { Link } from 'react-router-dom'

export default function VaultCard({ title, price, description, buttonText, slug }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition">
      <h3 className="text-xl font-bold text-vauntico-gold mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <p className="text-lg font-semibold text-white mb-4">{price}</p>
      {slug ? (
        <Link to={`/vaults/${slug}`}>
          <button className="bg-vauntico-gold text-black px-4 py-2 rounded hover:bg-yellow-400 transition">
            {buttonText}
          </button>
        </Link>
      ) : (
        <button className="bg-vauntico-gold text-black px-4 py-2 rounded hover:bg-yellow-400 transition" disabled>
          {buttonText}
        </button>
      )}
    </div>
  );
}