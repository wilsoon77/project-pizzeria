import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Clock, PizzaIcon, ThumbsUp } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-[600px] flex items-center bg-gradient-to-r from-[#D72323] to-[#e25050] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Las mejores pizzas artesanales de la ciudad
              </h1>
              <p className="text-lg mb-8">
                Descubre nuestras deliciosas pizzas, elaboradas con ingredientes frescos y de la mejor calidad. ¡Sabor auténtico en cada bocado!"
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/menu" className="btn bg-white text-[#D72323] hover:bg-gray-100">
                  Ver menú
                </Link>
                <Link to="/cart" className="btn border-2 border-white text-white hover:bg-white hover:text-[#D72323]">
                  Ordenar ahora
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <img 
                src="https://images.pexels.com/photos/2233348/pexels-photo-2233348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Pizza Deliciosa" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por qué elegir PizzaDelicia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <PizzaIcon size={40} className="text-[#D72323]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ingredientes frescos</h3>
              <p className="text-gray-600">
                Utilizamos solo los ingredientes más frescos y de la mejor calidad para elaborar nuestras pizzas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Clock size={40} className="text-[#D72323]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Entrega rápida</h3>
              <p className="text-gray-600">
                Entregamos tu pedido en menos de 30 minutos o recibirás un descuento en tu próxima compra.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <ThumbsUp size={40} className="text-[#D72323]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Satisfacción garantizada</h3>
              <p className="text-gray-600">
                Si no estás satisfecho con tu pedido, te ofrecemos una solución que te dejará contento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Pizzas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Nuestras pizzas más populares</h2>
            <Link to="/menu" className="flex items-center text-[#D72323] hover:underline">
              Ver todas <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ejemplo de pizzas populares */}
            <div className="pizza-card">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e" 
                  alt="Pizza Margarita" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(128)</span>
                </div>
                <h3 className="text-xl font-bold">Margarita Clásica</h3>
                <p className="text-gray-600 my-2">Salsa de tomate, mozzarella fresca y albahaca.</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xl font-bold">Q70.12</p>
                  <Link to="/menu" className="btn-primary text-sm">
                    Añadir al carrito
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="pizza-card">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1628840042765-356cda07504e" 
                  alt="Pizza Pepperoni" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(95)</span>
                </div>
                <h3 className="text-xl font-bold">Pepperoni Especial</h3>
                <p className="text-gray-600 my-2">Salsa de tomate, mozzarella, pepperoni italiano.</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xl font-bold">Q85.72</p>
                  <Link to="/menu" className="btn-primary text-sm">
                    Añadir al carrito
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="pizza-card">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1566843971939-1fe9e277a0c0" 
                  alt="Pizza 4 Quesos" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(74)</span>
                </div>
                <h3 className="text-xl font-bold">Cuatro Quesos</h3>
                <p className="text-gray-600 my-2">Mozzarella, gorgonzola, parmesano y provolone.</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xl font-bold">Q101.32</p>
                  <Link to="/menu" className="btn-primary text-sm">
                    Añadir al carrito
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delivery Section */}
      <section className="py-16 bg-[#D72323] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Entrega rápida a domicilio</h2>
              <p className="text-lg mb-6">
                Disfruta de nuestras deliciosas pizzas en la comodidad de tu hogar. Hacemos entregas rápidas en toda la ciudad.
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white p-3 rounded-full">
                  <Truck size={24} className="text-[#D72323]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Entrega gratuita</h3>
                  <p>En pedidos superiores a Q100</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <Clock size={24} className="text-[#D72323]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">30 minutos o menos</h3>
                  <p>Garantizamos entregas rápidas</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://images.pexels.com/photos/5792324/pexels-photo-5792324.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Entrega de pizza" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para probar nuestras deliciosas pizzas?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Haz tu pedido ahora y disfruta de la auténtica pizza italiana en menos de 30 minutos. ¡Tu paladar te lo agradecerá!
          </p>
          <Link to="/menu" className="btn-primary text-lg py-3 px-8">
            Ordenar ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;