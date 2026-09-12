import { useSelector } from "react-redux";


const menuItems = () => {
  const userData = JSON.parse(localStorage.getItem('users'))
  // const user = useSelector((state) => state.auth.user);



  const admin = {
    items: [
      {
        id: 'main',
        title: 'Main',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: 'feather icon-home',
            url: '/dashboard'
          },
          {
            id: 'table',
            title: 'Projects',
            type: 'item',
            icon: 'feather icon-server',
            url: '/projects'
          }
        ]
      },
      {
        id: 'finance',
        title: 'Finance',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Booking',
            title: 'Bookings',
            type: 'item',
            icon: 'feather icon-calendar',
            url: '/bookings',
            // badge: { title: '287', type: 'badge-bookings' }
          },
          {
            id: 'Pre Booking',
            title: 'Pre Bookings',
            type: 'item',
            icon: 'feather icon-book',
            url: '/prebooking',
            // badge: { title: '1', type: 'badge-prebookings' }
          },
          {
            id: 'Receive Amount',
            title: 'Receive Amount',
            type: 'item',
            icon: 'feather icon-briefcase',
            url: '/receiveamount'
          }
        ]
      },
      {
        id: 'reports',
        title: 'Reports',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Report',
            title: 'Reports',
            type: 'item',
            url: '/reports',
            icon: 'feather icon-file-text'
          }
        ]
      },
      {
        id: 'system',
        title: 'System',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            url: '/profile',
            icon: 'feather icon-user'
          }
        ]
      }
    ]
  };

  const superAdmin = {
    items: [
      {
        id: 'main',
        title: 'Main',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: 'feather icon-home',
            url: '/dashboard'
          },
          {
            id: 'Properties',
            title: 'Properties',
            type: 'item',
            url: '/Properties',
            icon: 'feather icon-layers'
          },
          {
            id: 'table',
            title: 'Projects',
            type: 'item',
            icon: 'feather icon-server',
            url: '/projects'
          }
        ]
      },
      {
        id: 'finance',
        title: 'Finance',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Booking',
            title: 'Bookings',
            type: 'item',
            icon: 'feather icon-calendar',
            url: '/bookings',
            // badge: { title: '287', type: 'badge-bookings' }
          },
          {
            id: 'Pre Booking',
            title: 'Pre Bookings',
            type: 'item',
            icon: 'feather icon-book',
            url: '/prebooking',
            // badge: { title: '1', type: 'badge-prebookings' }
          },
          {
            id: 'Receive Amount',
            title: 'Receive Amount',
            type: 'item',
            icon: 'feather icon-briefcase',
            url: '/receiveamount'
          }
        ]
      },
      {
        id: 'reports',
        title: 'Reports',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Report',
            title: 'Reports',
            type: 'item',
            url: '/reports',
            icon: 'feather icon-file-text'
          }
        ]
      },
      {
        id: 'system',
        title: 'System',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Users',
            title: 'Users',
            type: 'item',
            url: '/users',
            icon: 'feather icon-users'
          },
          {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            url: '/profile',
            icon: 'feather icon-user'
          }
        ]
      }
    ]
  };

  const accounted = {
    items: [
      {
        id: 'main',
        title: 'Main',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: 'feather icon-home',
            url: '/dashboard'
          },
          {
            id: 'property',
            title: 'property',
            type: 'item',
            url: '/property',
            icon: 'feather icon-layers'
          }
        ]
      },
      {
        id: 'finance',
        title: 'Finance',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Receive Amount',
            title: 'Receive Amount',
            type: 'item',
            icon: 'feather icon-briefcase',
            url: '/receiveamount'
          }
        ]
      },
      {
        id: 'reports',
        title: 'Reports',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Report',
            title: 'Reports',
            type: 'item',
            url: '/reports',
            icon: 'feather icon-file-text'
          }
        ]
      },
      {
        id: 'system',
        title: 'System',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            url: '/profile',
            icon: 'feather icon-user'
          }
        ]
      }
    ]
  };

  const DataEntry = {
    items: [
      {
        id: 'main',
        title: 'Main',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: 'feather icon-home',
            url: '/dashboard'
          },
          {
            id: 'table',
            title: 'Projects',
            type: 'item',
            icon: 'feather icon-server',
            url: '/projects'
          }
        ]
      },
      {
        id: 'finance',
        title: 'Finance',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Booking',
            title: 'Bookings',
            type: 'item',
            icon: 'feather icon-calendar',
            url: '/bookings',
            // badge: { title: '287', type: 'badge-bookings' }
          },
          {
            id: 'Receive Amount',
            title: 'Receive Amount',
            type: 'item',
            icon: 'feather icon-briefcase',
            url: '/receiveamount'
          }
        ]
      },
      {
        id: 'reports',
        title: 'Reports',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'Report',
            title: 'Reports',
            type: 'item',
            url: '/reports',
            icon: 'feather icon-file-text'
          }
        ]
      },
      {
        id: 'system',
        title: 'System',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            url: '/profile',
            icon: 'feather icon-user'
          }
        ]
      }
    ]
  };

  const currentMenu =
    userData?.role_id === 1
      ? superAdmin
      : userData?.role_id === 2
        ? admin
        : userData?.role_id === 3
          ? accounted
          : DataEntry;

  return currentMenu;
}

export const isUrlAllowed = (path) => {
  const userData = JSON.parse(localStorage.getItem("users"));
  if (!userData) return false;

  // 👇 Ye routes menu me nahi honge but allowed honge
  const alwaysAllowed = ['/profile', '/agreement', '/Allotments', '/bookings/details',
    '/receiveamount/add', '/pendingamount', '/Docunent/Add', '/MoreInfo', '/project/complete', '/project/remarks', '/receiveamount/details', '/project/map'];

  if (
    alwaysAllowed.some(
      (url) => path === url || path.startsWith(url + "/")
    )
  ) {
    return true;
  }

  const menu = menuItems();
  const allowedUrls = [];

  menu.items.forEach((group) => {
    group.children.forEach((item) => {
      if (item.url) {
        allowedUrls.push(item.url);
      }
    });
  });

  return allowedUrls.some(
    (url) => path === url || path.startsWith(url + "/")
  );
};



export default menuItems;
