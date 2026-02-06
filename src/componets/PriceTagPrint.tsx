import React from 'react';
import Barcode from 'react-barcode';
import { Product } from '../pages/ProductsPage';

export const PriceTagPrint: React.FC<{ produtos: Product[] }> = ({ produtos }) => {
    if (!produtos.length) return null;

    return (
        <div id="print-area">
            <style>{`
        @media screen { #print-area { display: none; } }
        @media print {
          @page { size: 106mm 30mm; margin: 0; }
          body { margin: 0; padding: 0; }
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
  
          #print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 106mm;
            display: flex;
            flex-wrap: wrap;
          }
  
          .tag-box {
            width: 35mm;
            height: 30mm;
            display: flex;
            align-items: center;
            justify-content: center;
            break-inside: avoid;
          }
  
          .content-cell {
            width: 100%;
            height: 100%;
            text-align: center;
            padding: 1mm;
            box-sizing: border-box;
          }
  
          .product-name {
            font-size: 7pt;
            font-weight: bold;
            line-height: 1.1;
            max-height: 2.2em;
            overflow: hidden;
          }
  
          .price-label {
            font-size: 9pt;
            font-weight: bold;
          }
        }
        `}</style>

            {produtos.map((p, i) => (
                <React.Fragment key={p.id}>
                    <div className="tag-box">
                        <div className="content-cell">
                            <div className="product-name" style={{ marginBottom: '1mm' }}>{p.nome}</div>
                            <Barcode
                                value={p.sku || String(p.id)}
                                width={0.6}
                                height={18}
                                fontSize={7}
                                margin={0}
                                displayValue
                            />
                            <div className="price-label">
                                {(p.preco ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </div>
                    </div>

                    {(i + 1) % 3 === 0 && <div style={{ pageBreakAfter: 'always' }} />}
                </React.Fragment>
            ))}
        </div>
    );
};
