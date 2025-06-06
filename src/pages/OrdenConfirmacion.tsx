import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const { orden_id, total } = location.state || { orden_id: 'N/A', total: 0 };

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
        <p className="text-xl mb-2">Tu orden #{orden_id} ha sido registrada correctamente.</p>
        <p className="text-gray-600 mb-6">
          Hemos enviado un correo electrónico con los detalles de tu pedido.
          Pronto estarás disfrutando de tu deliciosa pizza.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Total pagado:</span> Q{total.toFixed(2)}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Método de pago:</span> Pago en la entrega
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/" className="btn-primary block w-full py-3">
            Volver al menú principal
          </Link>

          {/* <Link to={`/orden/${orden_id}`} className="text-[#D72323] hover:underline block mt-4">
            Seguir estado de mi pedido
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;