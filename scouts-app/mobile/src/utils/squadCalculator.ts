import { GradeLevel, Gender, SquadName } from '../types';

export function calculateSquad(grade: GradeLevel, gender: Gender): SquadName {
  if (grade === 'KG1' || grade === 'KG2' || grade === 'GRADE_1' || grade === 'GRADE_2') {
    return 'براعم';
  }
  
  if (grade === 'GRADE_3' || grade === 'GRADE_4' || grade === 'GRADE_5' || grade === 'GRADE_6') {
    return gender === 'MALE' ? 'أشبال' : 'زهرات';
  }
  
  if (grade === 'PREP_1' || grade === 'PREP_2' || grade === 'PREP_3') {
    return gender === 'MALE' ? 'كشاف' : 'مرشدات';
  }
  
  if (grade === 'SEC_1' || grade === 'SEC_2' || grade === 'SEC_3') {
    return gender === 'MALE' ? 'متقدم' : 'رائدات';
  }
  
  // College & Graduates
  return 'جوالة';
}
