import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CTAButton from '../components/CTAButton';
import { SidebarInset } from '../components/ui/sidebar';

const VAULTS = [
  {
    slug: 'creator-toolkit',
    title: 'Creator’s Toolkit',
    price: '$49',
    description:
      'Prompts and templates for influencers, creators, and personal brands.',
  },
  {
    slug: 'agency-arsenal',
    title: 'Agency Arsenal',
    price: '$99',
    description:
      'Client-ready workflows, pitch decks, and automation templates.',
  },
  {
    slug: 'ecommerce-empire',
    title: 'E-commerce Empire',
    price: '$149',
    description:
      'Product descriptions, ad copy, and branding kits for online stores.',
  },
];

export default function VaultDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const vault = useMemo(() => VAULTS.find((v) => v.slug === slug), [slug]);

  if (!vault) {
    return (
      <SidebarInset>
        <div className="bg-black text-white min-h-screen px-6 py-12">
          <h1 className="text-2xl font-bold mb-4">Vault not found</h1>
          <Link to="/vaults" className="text-vauntico-gold underline">
            Back to Vaults
          </Link>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="bg-black text-white min-h-screen px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-vauntico-gold mb-4">{vault.title}</h1>
          <p className="text-gray-300 mb-6">{vault.description}</p>
          <p className="text-2xl font-semibold mb-8">{vault.price}</p>
          <CTAButton
            label={`Unlock ${vault.title}`}
            onClick={() => navigate('/vault-success')}
          />
          <div className="mt-8">
            <Link to="/vaults" className="text-gray-400 underline">
              Back to Vaults
            </Link>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}