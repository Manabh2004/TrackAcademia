import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/shared/HomeScreen';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import SyllabusScreen from '../screens/student/SyllabusScreen';
import MarksScreen from '../screens/student/MarksScreen';
import TimetableScreen from '../screens/student/TimetableScreen';
import DoubtsScreen from '../screens/student/DoubtsScreen';

const Tab = createBottomTabNavigator();
export default function StudentTabs({ setUser, user }) {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} setUser={setUser} user={user} subjectRoute="/subjects/for-student" />}
      </Tab.Screen>
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Syllabus" component={SyllabusScreen} />
      <Tab.Screen name="Marks" component={MarksScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Doubts" component={DoubtsScreen} />
    </Tab.Navigator>
  );
}
