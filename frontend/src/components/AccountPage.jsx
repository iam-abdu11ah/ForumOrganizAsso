import {useState} from 'react';
import {useUser} from '../context/userContext';
import UserList from './UserList.jsx';

function AccountPage(){

    const { user } = useUser();

    // booléen qui definie si on affiche la liste des utilisateur member ou non
    const [displayMember, setDisplayMember] = useState(true);

    // state changer par le composant User pour actualisé la liste des User
    const [updateList, setUpdateList] = useState(true);

    return (
    <div className='AccountPage'>
        {(user.isAdmin &&
             <button onClick={() => {setDisplayMember(!displayMember); setUpdateList(true)}}>
                {displayMember ? "afficher les comptes en attente de validation" : "afficher les membres"}
             </button>)}

        <UserList
            displayMember={displayMember}
            setUpdateList={setUpdateList}
            updateList={updateList}
        />

    </div>)

}

export default AccountPage;
