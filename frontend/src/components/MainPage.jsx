import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';

// mise en page commune à toutes les pages une fois connecté : le header + la page courante
function MainPage() {
  return (
    <div>
        <Header />

        <div className="section">
            <div className="contentZone">
                <Outlet />
            </div>
        </div>
    </div>
  );
}

export default MainPage;
