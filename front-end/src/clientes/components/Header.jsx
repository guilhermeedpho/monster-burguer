import "../styles/Header.css";

export default function Header() {

  return (

    <header className="cliente-header">

      <div className="overlay">

        <h1>🍔 Monster Burguer</h1>

        <p>
          Delivery • Retirada • Hambúrguer Artesanal
        </p>

        <input
          type="text"
          placeholder="Pesquisar produtos..."
        />

      </div>

    </header>

  );

}