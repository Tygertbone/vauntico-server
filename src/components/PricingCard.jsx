import React from 'react';
import PropTypes from 'prop-types';

const PricingCard = ({ name, description, pricing, features = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {/* Pricing Display */}
      <div className="mb-6">
        {pricing && (
          <div className="space-y-2">
            {pricing.usd && (
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">${pricing.usd}</span>
                <span className="text-gray-500 text-sm">/month (USD)</span>
              </div>
            )}

            {/* Currency Options */}
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {pricing.zar && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                  R{pricing.zar} ZAR
                </span>
              )}
              {pricing.ngn && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                  ₦{pricing.ngn} NGN
                </span>
              )}
              {pricing.eur && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  €{pricing.eur} EUR
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Features List */}
      {features && features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-900">Features:</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <div className="text-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full">
          Choose Plan
        </button>
      </div>
    </div>
  );
};

PricingCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  pricing: PropTypes.shape({
    usd: PropTypes.number,
    zar: PropTypes.number,
    ngn: PropTypes.number,
    eur: PropTypes.number
  }),
  features: PropTypes.arrayOf(PropTypes.string)
};

export default PricingCard;
