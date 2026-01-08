import { useNavigate } from 'react-router-dom';
import CTAButton from '../components/CTAButton';
import VaultCard from '../components/VaultCard';
import PricingTable from '../components/PricingTable';

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <VaultCard />
      <PricingTable />
      <CTAButton label="Unlock Creator Toolkit" onClick={() => navigate('/vault/creator')} />
      <CTAButton label="Unlock Agency Arsenal" onClick={() => navigate('/vault/agency')} />
      <CTAButton label="Unlock E-commerce Empire" onClick={() => navigate('/vault/ecommerce')} />
    </div>
  );
};

export default PricingPage;

