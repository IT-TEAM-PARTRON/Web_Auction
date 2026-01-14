function MapEmbed() {
  return (
    <div className="h-[400px]">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3813.7855963379025!2d105.62764001093059!3d21.31145068032779!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134e51df00c57f7%3A0xbb8628fa77362f69!2sC%C3%B4ng%20ty%20TNHH%20Partron%20Vina%20(X%C6%B0%E1%BB%9Fng%20V4)!5e1!3m2!1svi!2s!4v1757658608634!5m2!1svi!2s"
        width="600"
        height="450"
        className="w-[300px] h-[350px] sm:h-[400px] md:w-full md:h-[400px] lg:h-[400px] lg:w-[400px] xl:h-[450px] xl:w-[650px] rounded-lg shadow-lg"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="google-map"
      ></iframe>
    </div>
  );
}

export default MapEmbed;
