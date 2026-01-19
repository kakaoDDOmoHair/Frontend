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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
  },
  iconBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: '#AFAFAF',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

