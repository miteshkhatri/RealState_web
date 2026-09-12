import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import { BASE_URL } from './config/constant';
import Login from './views/auth/signin/SignIn1';
import AuthGuard from './AuthGuard';
import { useSelector } from 'react-redux';
function ProtectedGuard({ children }) {
  const ReduxUserData =  useSelector((state) => state.auth.user);
  const userData = JSON.parse(localStorage.getItem('users'));
 
  return ReduxUserData?.user_token ? <Navigate to={'/dashboard'} /> : children;
}

 
export const renderRoutes = (routes = []) => (  
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    path: '/login',
    exact: 'true',
    element: lazy(() => import('./views/auth/signin/SignIn1')),
    guard: ProtectedGuard
  },
  // {
  //   exact: 'true',
  //   path: '/auth/signup-1',
  //   element: lazy(() => import('./views/auth/signup/SignUp1'))
  // },
  {
    path: '*',
    layout: AdminLayout,
    guard: AuthGuard,
    routes: [
      {
        exact: 'true',
        path: '/dashboard',
        element: lazy(() => import('./views/dashboard'))
      },
      {
        exact: 'true',
        path: '/reports',
        element: lazy(() => import('./views/report/index'))
      },
      {
        exact: 'true',
        path: '/basic/button',
        element: lazy(() => import('./views/ui-elements/basic/BasicButton'))
      },
      {
        exact: 'true',
        path: '/profile',
        element: lazy(() => import('./views/profile/index'))
      },
      {
        exact: 'true',
        path: '/profile/update',
        element: lazy(() => import('./views/profile/updateprofile'))
      },
      {
        exact: 'true',
        path: '/basic/badges',
        element: lazy(() => import('./views/ui-elements/basic/BasicBadges'))
      },
      {
        exact: 'true',
        path: '/basic/breadcrumb-paging',
        element: lazy(() => import('./views/ui-elements/basic/BasicBreadcrumb'))
      },
      {
        exact: 'true',
        path: '/basic/collapse',
        element: lazy(() => import('./views/ui-elements/basic/BasicCollapse'))
      },
      {
        exact: 'true',
        path: '/basic/tabs-pills',
        element: lazy(() => import('./views/ui-elements/basic/BasicTabsPills'))
      },
      {
        exact: 'true',
        path: '/basic/typography',
        element: lazy(() => import('./views/ui-elements/basic/BasicTypography'))
      },
      {
        exact: 'true',
        path: '/forms/form-basic',
        element: lazy(() => import('./views/forms/FormsElements'))
      },

      {
        exact: 'true',
        path: '/project/map/:project_id',
        element: lazy(() => import('./views/dashboard/ColonyMockMap')) 
      },

      {
        
        exact: 'true',
path:'/project/complete/:project_id',
  element: lazy(() => import('./views/dashboard/CompletedProjectView'))
},
      // {
      //   exact: 'true',
      //   path: '/projects',
      //   element: lazy(() => import('../src/components/Project'))
      // },
      {
        exact: 'true',
        path: '/projects',
        element: lazy(() => import('./views/projects/ProjectTable'))
      },
      {
        exact: 'true',
        path: '/charts/nvd3',
        element: lazy(() => import('./views/charts/nvd3-chart'))
      },
      {
        exact: 'true',
        path: '/maps/google-map',
        element: lazy(() => import('./views/maps/GoogleMaps'))
      },
      {
        exact: 'true',
        path: '/sample-page',
        element: lazy(() => import('./views/extra/SamplePage'))
      },
      {
        exact: 'true',
        path: '/projects/createproject',
        element: lazy(() => import('./views/projects/AddProject'))
      },
      {
        exact: 'true',
        path: '/bookings',
        element: lazy(() => import('./views/bookings/BookingTable'))
      },
      {
        exact: 'true',
        path: '/prebooking',
        element: lazy(() => import('./views/prebooking/Table'))
      },
      {
        exact: 'true',
        path: '/prebooking/add',
        element: lazy(() => import('./views/prebooking/AddBooking'))
      },
      {
        exact: 'true',
        path: '/project/remarks/:projectId',
        element: lazy(() => import('./views/Remark/RemarkLayout')) // Aapka naya Remark Layout component
      },
      {
        exact: 'true',
        path: '/projects/plots',
        element: lazy(() => import('./components/PlotTable'))
      },

      
      
      {
        exact: 'true',
        path: '/project/plots/add',
        element: lazy(() => import('./components/AddPlot'))
      },
      {
        exact: 'true',
        path: '/dashboard/projects/details',
        element: lazy(() => import('./views/dashboard/Projectview'))
      },
//       {
//   exact: 'true',
//   path: '/receipt/:bookingId',
//   element: lazy(() => import('./views/Receipt/ReceiptPrint'))
// },
      {
        exact: 'true',
        path: '/bookings/add',
        element: lazy(() => import('./views/bookings/AddBooking'))
      },


      


      {
        exact: 'true',
        path: '/MoreInfo',
        element: lazy(() => import('./views/bookings/MoreInfo'))
      },
       {
        exact: 'true',
        path: '/Docunent/Add',
        element: lazy(() => import('./views/bookings/Add_Document'))
      },
      {
        exact: 'true',
        path: '/receiveamount',
        element: lazy(() => import('./views/ReceiveAmount/index'))
      },
      {
        exact: 'true',
        path: '/pendingamount',
        element: lazy(() => import('./views/ReceiveAmount/index'))
      },
      {
        exact: 'true',
        path: '/receiveamount/add',
        element: lazy(() => import('./views/ReceiveAmount/AmountTable'))
      },
    {
  exact: true,
  path: '/bookings/details/',
  element: lazy(() => import('./views/bookings/SinglePlot'))
},
      {
        exact: 'true',
        path: '/users',
        element: lazy(() => import('./views/CreateUser/index'))
      },
      {
        exact: 'true',
        path: '/users/add',
        element: lazy(() => import('./views/CreateUser/AddUser'))
      },
      {
        exact: 'true',
        path: '/agreement',
        element: lazy(() => import('./views/Agreement/Index'))
      },
      {
        exact: 'true',
        path: '/Allotments',
        element: lazy(() => import('./views/Allotments/Index'))
      },
      {
        exact: 'true',
        path: '/receiveamount/details/:plot_id',
        element: lazy(() => import('./views/ReceiveAmount/SingleReceiveData'))
      },
      {
        exact: 'true',
        path: '/Properties',
        element: lazy(() => import('./views/property/Table'))
      },
      {
        exact: 'true',
        path: '/allotmentsListing',
        element: lazy(() => import('./views/projects/ProjectTable'))
      },
      {
        exact: 'true',
        path: '/registries',
       element: lazy(() => import('./views/projects/ProjectTable'))
      },
      {
        exact: 'true',
        path: '/Properties/Add',
        element: lazy(() => import('./views/property/Property'))
      },
       {
        exact: 'true',
        path: '/Properties/edit',
        element: lazy(() => import('./views/property/Property'))
      },
      {
        exact: 'true',
        path: '/Properties/details',
        element: lazy(() => import('./views/property/Payment_list'))
      },
      {
        path: '*',
        exact: 'true',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  }
];

export default routes;
