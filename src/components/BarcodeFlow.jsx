import { useState } from 'react';
import { useStore } from '../lib/store';
import { fetchProductByBarcode } from '../lib/openFoodFacts';
import BarcodeScannerView from './BarcodeScannerView';
import BarcodeConfirmCard from './BarcodeConfirmCard';
import QuantityPicker from './QuantityPicker';
import CustomFoodForm from './CustomFoodForm';

export default function BarcodeFlow({ section, onSectionChange, onDone, onCancel }) {
  const { state, cacheBarcodeProduct, logItem } = useStore();
  const [phase, setPhase] = useState('scan'); // scan | loading | confirm | quantity | notfound | offline
  const [barcode, setBarcode] = useState(null);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [resolvedItem, setResolvedItem] = useState(null);

  const handleDetected = async (code) => {
    setBarcode(code);

    // Always check the local cache first so scanned/saved products work offline.
    const cached = state.barcodeProducts[code];
    if (cached) {
      setResolvedItem({ ...cached, id: code, type: 'barcode' });
      setPhase('quantity');
      return;
    }

    setPhase('loading');
    try {
      const result = await fetchProductByBarcode(code);
      if (!result) {
        setPhase('notfound');
        return;
      }
      setFetchedProduct(result);
      setPhase('confirm');
    } catch {
      setPhase('offline');
    }
  };

  const handleConfirmed = (finalFields) => {
    cacheBarcodeProduct(barcode, finalFields);
    setResolvedItem({ ...finalFields, id: barcode, type: 'barcode' });
    setPhase('quantity');
  };

  const handleCustomFoodSaved = (savedFood) => {
    if (savedFood?.barcode) {
      cacheBarcodeProduct(savedFood.barcode, savedFood);
    }
    onDone();
  };

  if (phase === 'scan') {
    return <BarcodeScannerView onDetected={handleDetected} onCancel={onCancel} />;
  }

  if (phase === 'loading') {
    return <div className="py-10 text-center text-sm text-slate-400">Looking up barcode {barcode}...</div>;
  }

  if (phase === 'confirm' && fetchedProduct) {
    return <BarcodeConfirmCard product={fetchedProduct} onConfirm={handleConfirmed} onCancel={onCancel} />;
  }

  if (phase === 'quantity' && resolvedItem) {
    return (
      <QuantityPicker
        item={resolvedItem}
        section={section}
        onSectionChange={onSectionChange}
        onCancel={onCancel}
        onConfirm={(payload) => {
          logItem({ section, item: resolvedItem, ...payload });
          onDone();
        }}
      />
    );
  }

  if (phase === 'notfound' || phase === 'offline') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          {phase === 'notfound'
            ? "Not in the Open Food Facts database. Type in the label values once and it's saved forever under this barcode."
            : "You're offline and this barcode isn't saved on this device yet. Type in the label values now, or cancel and try again once you're back online."}
        </div>
        <CustomFoodForm prefillBarcode={barcode} onDone={handleCustomFoodSaved} />
      </div>
    );
  }

  return null;
}
