import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../utils/storage';
import { apiService } from '../services/apiService';

const DashboardScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    mesasDisponibles: 0,
    pedidosPendientes: 0,
    reservasHoy: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserInfo();
    loadStats();
  }, []);

  const loadUserInfo = async () => {
    try {
      const info = await storageService.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Cargar estadísticas del dashboard
      const [mesasDisponibles, pedidosPendientes, reservasHoy] = await Promise.all([
        apiService.getMesasDisponibles(),
        apiService.getPedidosPendientes(),
        apiService.getReservasHoy()
      ]);

      setStats({
        mesasDisponibles: mesasDisponibles.length,
        pedidosPendientes: pedidosPendientes.length,
        reservasHoy: reservasHoy.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          onPress: async () => {
            await storageService.clearAuthData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Gestión de Mesas',
      icon: 'restaurant-outline',
      screen: 'Mesas',
      color: '#4CAF50'
    },
    {
      title: 'Gestión de Pedidos',
      icon: 'receipt-outline',
      screen: 'Pedidos',
      color: '#FF9800'
    },
    {
      title: 'Gestión de Reservas',
      icon: 'calendar-outline',
      screen: 'Reservas',
      color: '#9C27B0'
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.userNameText}>{userInfo?.nombre}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen del día</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="restaurant-outline" size={30} color="#fff" />
            <Text style={styles.statNumber}>{stats.mesasDisponibles}</Text>
            <Text style={styles.statLabel}>Mesas Disponibles</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="receipt-outline" size={30} color="#fff" />
            <Text style={styles.statNumber}>{stats.pedidosPendientes}</Text>
            <Text style={styles.statLabel}>Pedidos Pendientes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
            <Ionicons name="calendar-outline" size={30} color="#fff" />
            <Text style={styles.statNumber}>{stats.reservasHoy}</Text>
            <Text style={styles.statLabel}>Reservas Hoy</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Gestión</Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
  },
  userNameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default DashboardScreen;