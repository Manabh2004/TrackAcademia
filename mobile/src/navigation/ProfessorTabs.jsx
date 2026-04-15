import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/shared/HomeScreen';
import AttendanceScreen from '../screens/professor/AttendanceScreen';
import SyllabusScreen from '../screens/professor/SyllabusScreen';
import DoubtsScreen from '../screens/professor/DoubtsScreen';
import TimetableScreen from '../screens/professor/TimetableScreen';
import MarksScreen from '../screens/professor/MarksScreen';

const Tab = createBottomTabNavigator();
export default function ProfessorTabs({ setUser, user }) {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} setUser={setUser} user={user} roleLabel="Professor" subjectRoute="/subjects/my" />}
      </Tab.Screen>
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Syllabus" component={SyllabusScreen} />
      <Tab.Screen name="Doubts" component={DoubtsScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Marks" component={MarksScreen} />
    </Tab.Navigator>
  );
}
