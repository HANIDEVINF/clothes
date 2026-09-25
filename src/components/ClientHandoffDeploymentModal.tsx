import React, { useState } from 'react';
import {
  X,
  Rocket,
  Database,
  Globe,
  DollarSign,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Layers,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { CASUAL_STORE_INFO } from '../data/casualAlgeriaData';

interface ClientHandoffDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'ar' | 'en';
}

export const ClientHandoffDeploymentModal: React.FC<ClientHandoffDeploymentModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'client_pitch' | 'vercel' | 'supabase' | 'commercial_addons'>('client_pitch');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const supabaseSqlSchema = `-- 1. Table des Produits CASUAL 29
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  subtitle TEXT,
  category VARCHAR(100) NOT NULL,
  price_dzd INTEGER NOT NULL,
  cost_price_dzd INTEGER NOT NULL,
  compare_at_price_dzd INTEGER,
  stock INTEGER DEFAULT 0,
  sizes TEXT[] DEFAULT ARRAY['M', 'L', 'XL', 'XXL'],
  images TEXT[] NOT NULL,
  description TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  is_featured BOOLEAN DEFAULT false,
  badge VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des Commandes (58 Wilayas d'Algérie)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  wilaya_code VARCHAR(5) NOT NULL,
  wilaya_name VARCHAR(100) NOT NULL,
  commune_address TEXT NOT NULL,
  delivery_type VARCHAR(20) DEFAULT 'home', -- 'home' ou 'stopdesk'
  shipping_cost_dzd INTEGER DEFAULT 500,
  total_amount_dzd INTEGER NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'cash_on_delivery',
  fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled', 
  -- 'unfulfilled', 'confirmed_phone', 'shipped_yalidine', 'delivered', 'cancelled'
  tracking_number VARCHAR(100),
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Lignes de Commande
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  selected_size VARCHAR(20),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_dzd INTEGER NOT NULL
);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les visiteurs de la boutique
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);
`;

  const supabaseClientCode = `// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0f1115] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800 bg-[#14171d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span>Guide de Livraison Client & Déploiement</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Freelance Guide
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Spécialement préparé pour votre client <strong className="text-zinc-200">CASUAL 29 Mascara (@cas_ual_29)</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 bg-[#0d0e12] px-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('client_pitch')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'client_pitch'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Présentation au Client (Farouk)</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Déploiement Vercel (Gratuit)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Base de Données Supabase</span>
          </button>

          <button
            onClick={() => setActiveTab('commercial_addons')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'commercial_addons'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>4. Options Payantes à Proposer</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* TAB 1: PRESENTATION AU CLIENT */}
          {activeTab === 'client_pitch' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                <p className="font-semibold text-sm mb-1 text-amber-300">
                  🎯 Comment impressionner Farouk (@farouk_habibo) avec ce prototype :
                </p>
                Le prototype est déjà entièrement personnalisé avec son vrai magasin à Mascara, son logo, son compte Instagram (@cas_ual_29), son numéro WhatsApp direct (0542364246), sa localisation sur la Rue 1 Novembre, et les photos exactes de ses publications (veste cuir, polo Old Money, sneakers Puma).
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-amber-400">Étape A : Envoyer le lien direct</span>
                  <h4 className="font-bold text-white text-base">Envoi sur WhatsApp du client</h4>
                  <p className="text-xs text-zinc-400">
                    Ouvrez WhatsApp et envoyez-lui le lien avec ce message prêt à l'emploi :
                  </p>
                  <div className="relative p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                    <p>
                      "Salam Farouk ! J'ai développé un prototype de boutique en ligne et logiciel de gestion pour ton magasin CASUAL Mascara. Tu peux tester sur ton téléphone : commande directe sur ton WhatsApp, panier en Dinars (DA) avec les 58 wilayas, et ton espace gérant pour suivre tes stocks. Dis-moi ce que tu en penses !"
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(
                          "Salam Farouk ! J'ai développé un prototype de boutique en ligne et logiciel de gestion pour ton magasin CASUAL Mascara. Tu peux tester sur ton téléphone : commande directe sur ton WhatsApp, panier en Dinars (DA) avec les 58 wilayas, et ton espace gérant pour suivre tes stocks. Dis-moi ce que tu en penses !",
                          'pitch_msg'
                        )
                      }
                      className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px]"
                    >
                      {copiedKey === 'pitch_msg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copier le message
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-emerald-400">Étape B : Faire la démonstration live</span>
                  <h4 className="font-bold text-white text-base">3 points clés à lui montrer</h4>
                  <ul className="text-xs space-y-2 text-zinc-400 list-disc list-inside">
                    <li>
                      <strong className="text-zinc-200">1. Commande WhatsApp en 1 clic :</strong> Cliquez sur "Commander via WhatsApp" sur la veste en cuir : un message pré-rempli s'ouvre directement avec son numéro 0542364246 !
                    </li>
                    <li>
                      <strong className="text-zinc-200">2. Formulaire Algérien 58 Wilayas :</strong> Pas de carte bancaire étrangère inutile, mais le vrai Cash à la Livraison (COD) avec calcul automatique des frais Yalidine.
                    </li>
                    <li>
                      <strong className="text-zinc-200">3. Espace Gérant Farouk :</strong> Cliquez sur "Espace Gérant" en haut pour lui montrer qu'il peut changer les prix en Dinars (DA), ajuster les stocks et imprimer des bons de commande.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">Contact Direct du Client (Instagram @cas_ual_29)</div>
                  <div className="text-xs text-zinc-400">Téléphone : {CASUAL_STORE_INFO.phoneFormatted} • Mascara (29)</div>
                </div>
                <a
                  href={`https://wa.me/213542364246?text=${encodeURIComponent('Salam Farouk, voici le prototype de ta boutique en ligne CASUAL 29 Mascara !')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Tester WhatsApp avec Farouk
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: VERCEL DEPLOYMENT */}
          {activeTab === 'vercel' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-base">Déploiement en 3 étapes sur Vercel (Hébergement 100% Gratuit)</h3>
                <p className="text-xs text-zinc-400">
                  Vercel fournit un CDN mondial ultra-rapide avec certificat SSL (HTTPS) gratuit et liaison continue à votre GitHub.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <span>Étape 1 : Pousser votre code sur GitHub</span>
                  </div>
                  <div className="relative p-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 space-y-1">
                    <p className="text-zinc-500"># Initialiser ou valider les modifications</p>
                    <p>git add .</p>
                    <p>git commit -m "feat: customize CASUAL 29 Mascara boutique and dashboard"</p>
                    <p>git push origin main</p>
                    <button
                      onClick={() =>
                        handleCopy(
                          'git add .\ngit commit -m "feat: customize CASUAL 29 Mascara boutique and dashboard"\ngit push origin main',
                          'git_cmd'
                        )
                      }
                      className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px]"
                    >
                      {copiedKey === 'git_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copier les commandes git
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <span>Étape 2 : Importer sur Vercel.com</span>
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside">
                    <li>Rendez-vous sur <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">vercel.com</a> et connectez-vous avec votre compte GitHub.</li>
                    <li>Cliquez sur <strong>"Add New Project"</strong> et sélectionnez votre repo <code className="text-amber-300 bg-zinc-900 px-1.5 py-0.5 rounded">ecom</code> (ou <code className="text-amber-300 bg-zinc-900 px-1.5 py-0.5 rounded">clotheswebsiteanddashboard</code>).</li>
                    <li>Vercel détecte automatiquement <strong>Vite</strong>. Les réglages par défaut sont parfaits :
                      <ul className="pl-6 mt-1 text-zinc-400 list-disc">
                        <li>Framework Preset: <code className="text-zinc-200">Vite</code></li>
                        <li>Build Command: <code className="text-zinc-200">npm run build</code></li>
                        <li>Output Directory: <code className="text-zinc-200">dist</code></li>
                      </ul>
                    </li>
                    <li>Cliquez sur <strong>"Deploy"</strong>. En 45 secondes, votre site sera en ligne avec une URL du type <code className="text-emerald-400">casual-mascara.vercel.app</code> !</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE BACKEND */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-base">Schéma Supabase (PostgreSQL) Prêt pour l'Algérie</h3>
                <p className="text-xs text-zinc-400">
                  Supabase offre une base PostgreSQL gratuite, l'authentification et le stockage d'images pour les vêtements de Casual 29.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400">Script SQL à coller dans le SQL Editor de Supabase :</span>
                  <button
                    onClick={() => handleCopy(supabaseSqlSchema, 'sql_schema')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    {copiedKey === 'sql_schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copier tout le Schéma SQL
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800 overflow-x-auto max-h-64 scrollbar-thin">
                  {supabaseSqlSchema}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400">Initialisation du Client Supabase dans React :</span>
                  <button
                    onClick={() => handleCopy(supabaseClientCode, 'client_code')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-semibold transition-colors"
                  >
                    {copiedKey === 'client_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copier le code
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800 overflow-x-auto">
                  {supabaseClientCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: COMMERCIAL ADDONS */}
          {activeTab === 'commercial_addons' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-base">Options & Personnalisations Facturables pour le Freelance</h3>
                <p className="text-xs text-zinc-400">
                  Après avoir validé ce prototype avec Farouk, voici les services à haute valeur ajoutée que vous pouvez lui facturer :
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">1. Nom de Domaine Pro</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      ~ 2,500 - 5,000 DA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Acheter un domaine comme <strong className="text-zinc-200">casual-mascara.dz</strong> ou <strong className="text-zinc-200">casual29.com</strong> et le lier en 1 clic sur Vercel. Donne une crédibilité maximale sur Instagram.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">2. Intégration API Yalidine</h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                      ~ 15,000 - 25,000 DA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Connecter l'API Yalidine ou ZR Express pour créer les bordereaux d'envoi et générer le code de suivi (Tracking) directement quand Farouk clique sur "Expédier".
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">3. Notifications WhatsApp Auto</h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                      ~ 10,000 - 18,000 DA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Envoi automatique d'un message WhatsApp au client dès que son colis est expédié avec le numéro de tracking et la confirmation du montant en DA.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#14171d] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">4. Maintenance & Shooting</h4>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                      Mensuel récurrent
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Proposer à Farouk un forfait mensuel (ex: 8,000 DA / mois) pour ajouter chaque semaine les nouveaux arrivages de vestes et pantalons, gérer les sauvegardes et surveiller le stock.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#14171d] flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Prêt pour livraison à <strong className="text-amber-400">Farouk Habibo (CASUAL 29 Mascara)</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors"
          >
            Fermer le Guide
          </button>
        </div>
      </div>
    </div>
  );
};
