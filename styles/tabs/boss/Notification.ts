import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
});