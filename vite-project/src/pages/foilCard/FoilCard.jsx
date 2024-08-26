import { useEffect, useState } from 'react';
import './FoilCard.css';
import Card from '../../components/card/Card';
import Select from 'react-select';
import Button from '../../components/button/Button';
import { TextField } from '@mui/material';
import Circle from '../../components/circle/Circle';

export default function FoilCard(props) {
    const [foilCardTableData, setFoilCardTableData] = useState([
        {
            courseCode: "22MA202",
            faculties: [
                { name: "David Raj", paperCount: 100 },
                { name: "Edward Raj", paperCount: 126 },
                { name: "David Raj", paperCount: 50 },
            ],
        },
    ]);

    // State to track statuses of circles for each course and faculty
    const [circleStatuses, setCircleStatuses] = useState({});
    // State to track foil card numbers for each course and faculty
    const [foilCardNumbers, setFoilCardNumbers] = useState({});
    // State to track the current circle for each row
    const [currentCircle, setCurrentCircle] = useState({});

    useEffect(() => {
        props.setTitle("Foil Card");
    }, [props]);

    const handleCircleClick = (courseCode, facultyIndex, circleIndex) => {
        setCurrentCircle({
            courseCode,
            facultyIndex,
            circleIndex
        });
    };

    const handleButtonClick = () => {
        const { courseCode, facultyIndex, circleIndex } = currentCircle;

        if (courseCode && facultyIndex !== undefined && circleIndex !== undefined) {
            setCircleStatuses(prevStatuses => {
                const newStatuses = { ...prevStatuses };

                if (!newStatuses[courseCode]) {
                    newStatuses[courseCode] = {};
                }

                if (!newStatuses[courseCode][facultyIndex]) {
                    const numberOfCircles = Math.ceil(
                        foilCardTableData.find(course => course.courseCode === courseCode)
                            .faculties[facultyIndex].paperCount / 25
                    );
                    newStatuses[courseCode][facultyIndex] = Array(numberOfCircles).fill('pending');
                }

                // Update statuses for all circles up to the current one
                newStatuses[courseCode][facultyIndex] = newStatuses[courseCode][facultyIndex].map((status, index) => {
                    if (index < circleIndex) return 'completed';
                    if (index === circleIndex) return 'selected';
                    return status;
                });

                // Mark the current circle as completed and move to the next one
                newStatuses[courseCode][facultyIndex] = newStatuses[courseCode][facultyIndex].map((status, index) => {
                    if (index === circleIndex) return 'completed';
                    return status;
                });

                // Move to the next circle
                const nextCircleIndex = circleIndex + 1;
                if (nextCircleIndex < newStatuses[courseCode][facultyIndex].length) {
                    setCurrentCircle(prev => ({
                        ...prev,
                        circleIndex: nextCircleIndex
                    }));
                } else {
                    // Set the current circle to null when no more circles are left
                    setCurrentCircle(prev => ({
                        ...prev,
                        circleIndex: null
                    }));
                }

                return newStatuses;
            });

            setFoilCardNumbers(prevNumbers => {
                const currentFoilCardNumber = document.getElementById(`foil-card-${courseCode}-${facultyIndex}-${circleIndex}`).value;

                return {
                    ...prevNumbers,
                    [courseCode]: {
                        ...prevNumbers[courseCode],
                        [facultyIndex]: {
                            ...prevNumbers[courseCode]?.[facultyIndex],
                            [circleIndex]: currentFoilCardNumber,
                        }
                    }
                };
            });
        }
    };

    const getColorForStatus = (courseCode, facultyIndex, circleIndex) => {
        if (currentCircle.courseCode === courseCode &&
            currentCircle.facultyIndex === facultyIndex &&
            currentCircle.circleIndex === circleIndex) {
            return 'blue'; // Current circle
        }
        return circleStatuses[courseCode]?.[facultyIndex]?.[circleIndex] === 'completed' ? 'green' : 'grey';
    };

    const isLastCircle = (courseCode, facultyIndex, circleIndex) => {
        return circleStatuses[courseCode]?.[facultyIndex] &&
            circleIndex === circleStatuses[courseCode][facultyIndex].length - 1;
    };

    return (
        <div className='foilCardPageContainer'>
            <Card content={
                <div className='foilCardTopSelects'>
                    <Select />
                    <Select />
                </div>
            } />
            <div className='foilTableContainer'>
                <table>
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Faculty</th>
                            <th>No. of Sets</th>
                            <th>Foil Card</th>
                        </tr>
                    </thead>
                    <tbody>
                        {foilCardTableData.map((course) => (
                            course.faculties.map((faculty, facultyIndex) => (
                                <tr key={`${course.courseCode}-${facultyIndex}`}>
                                    {facultyIndex === 0 && (
                                        <td rowSpan={course.faculties.length} align='center'>{course.courseCode}</td>
                                    )}
                                    <td>{faculty.name}</td>
                                    <td>{faculty.paperCount}</td>
                                    <td>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <div style={{ display: "flex", gap: "20px" }}>
                                                {[...Array(Math.ceil(faculty.paperCount / 25))].map((_, circleIndex) => (
                                                    <div
                                                        key={circleIndex}
                                                        onClick={() => handleCircleClick(course.courseCode, facultyIndex, circleIndex)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        
                                                        <Circle
                                                            text={circleIndex + 1}
                                                            color={getColorForStatus(course.courseCode, facultyIndex, circleIndex)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                <TextField
                                                    id={`foil-card-${course.courseCode}-${facultyIndex}-${currentCircle.circleIndex}`}
                                                    fullWidth
                                                    size='small'
                                                    placeholder={`Enter foil card no for ${faculty.name}`}
                                                    sx={{ backgroundColor: 'white' }}
                                                    value={foilCardNumbers[course.courseCode]?.[facultyIndex]?.[currentCircle.circleIndex] || ''}
                                                    onChange={(e) => {
                                                        const newFoilCardNumber = e.target.value;
                                                        setFoilCardNumbers(prevNumbers => ({
                                                            ...prevNumbers,
                                                            [course.courseCode]: {
                                                                ...prevNumbers[course.courseCode],
                                                                [facultyIndex]: {
                                                                    ...prevNumbers[course.courseCode]?.[facultyIndex],
                                                                    [currentCircle.circleIndex]: newFoilCardNumber,
                                                                }
                                                            }
                                                        }));
                                                    }}
                                                />
                                                <Button
                                                    size={"small"}
                                                    label={isLastCircle(course.courseCode, facultyIndex, currentCircle.circleIndex) ? "Complete" : "Next"}
                                                    onClick={handleButtonClick}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
