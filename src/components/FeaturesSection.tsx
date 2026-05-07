import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrint,
  faMoneyBill,
  faShieldAlt,
  faCreditCard,
  faTruck,
  faHeadset,
  
  faAward,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import LogoLoop from "./LogoLoop";

export default function FeaturesSection() {
  const features = [
    {

      icon: faPrint,
      title: "Produk Printer Lengkap",
      color: "text-blue-600",
    },
    {
      icon: faMoneyBill,
      title: "Harga Terjangkau",
      color: "text-green-600",
    },
    { 
      icon: faShieldAlt,
      title: "Toko Terpercaya", 
      color: "text-yellow-600",
    },
    {
      icon: faCreditCard,
      title: "Pembayaran Online",
      color: "text-purple-600",
    },
    {
      icon: faTruck,
      title: "Pengiriman Cepat",
      color: "text-red-600",
    },
    {
      icon: faHeadset,
      title: "Customer Service 24/7",
      color: "text-indigo-600",
    },
    {
      icon: faAward,
      title: "Produk Berkualitas",
      color: "text-orange-600",
    },
    {
      icon: faCheckCircle,
      title: "Garansi Resmi",
      color: "text-teal-600",
    },
  ];

  const logoItems = features.map((feature, index) => (
    <div key={index} className="flex flex-col items-center justify-center px-8">
      <FontAwesomeIcon 
        icon={feature.icon} 
        className={`h-12 w-12 ${feature.color}`}
      />
      <p className="mt-3 text-sm font-semibold text-zinc-700 text-center whitespace-nowrap">
        {feature.title}
      </p>
    </div>
  ));

  return (
    <section id="keunggulan" className="bg-emerald-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-2">
          <p className=" text-zinc-600">
            Berbagai keunggulan yang membuat pelanggan percaya pada kami
          </p>
        </div>

        <LogoLoop
          logos={logoItems}
          speed={50}
          direction="left"
          logoHeight={120}
          gap={40}
          hoverSpeed={0}
          fadeOut={true}
          scaleOnHover={true}
          className="py-8"
        />
      </div>
    </section>
  );
}
