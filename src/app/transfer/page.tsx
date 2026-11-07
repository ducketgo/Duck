import type { Metadata } from 'next';
import { TransferPanel } from '@/components/transfer-panel';
export const metadata: Metadata = { title: 'Transfert de fichiers' };
export default function TransferPage() { return <div className="wrap page-wrap transfer-page"><span className="section-kicker">PARTAGER UN FICHIER</span><h1 className="page-title">Un lien privé,<br/><span>sans créer de compte.</span></h1><p className="page-lede">Le fichier est chiffré en transit, conservé temporairement et supprimé après expiration. Le lien donne accès au téléchargement : partagez-le uniquement avec son destinataire.</p><TransferPanel/><p className="transfer-limits">Limite par fichier : 25 Mio · Lien valable 24 h · 3 envois et 20 téléchargements par heure et par adresse IP.</p></div> }
