import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar pantallas
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MesasScreen from '../screens/MesasScreen';
import PedidosScreen from '../screens/PedidosScreen';
import ReservasScreen from '../screens/ReservasScreen';
import CrearPedidoScreen from '../screens/CrearPedidoScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Restaurante Maranatha',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard Encargado',
            headerLeft: null, // Deshabilita el botón de volver
          }}
        />
        <Stack.Screen
          name="Mesas"
          component={MesasScreen}
          options={{
            title: 'Gestión de Mesas'
          }}
        />
        <Stack.Screen
          name="Pedidos"
          component={PedidosScreen}
          options={{
            title: 'Gestión de Pedidos'
          }}
        />
        <Stack.Screen
          name="Reservas"
          component={ReservasScreen}
          options={{
            title: 'Gestión de Reservas'
          }}
        />
        <Stack.Screen
          name="CrearPedido"
          component={CrearPedidoScreen}
          options={{
            title: 'Crear Nuevo Pedido'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;