import AuctionSection from "../components/layout/Auctions";
function HomePage() {
  return (
    <main className="shadow-[0_4px_24px_rgba(0,0,0,0.30)] p-4 rounded-xl">
      <AuctionSection titleKey="ongoing_auctions" type="ongoing" />
      <AuctionSection titleKey="upcoming_auctions" type="upcoming" />
      <AuctionSection titleKey="ended_auctions" type="ended" />
    </main>
  );
}

export default HomePage;
