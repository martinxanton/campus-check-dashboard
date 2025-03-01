// src/Dashboard.js
import React, { useEffect, useState } from "react";
import api from "./api";
import "./App.css";
import { DonutChart, LineChart } from "@tremor/react";
import moment from "moment";

function Dashboard() {
  const [staff, setStaff] = useState([]);
  const [generalRecords, setGeneralRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffResponse, generalRecordsResponse] = await Promise.all([
          api.get("/staff/"),
          api.get("/record/"),
        ]);

        setStaff(staffResponse.data.staff);
        setGeneralRecords(generalRecordsResponse.data.records);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data.");
      }
    };

    fetchData();
  }, []);

  // Transform generalRecords to get entries and exits by date
  const recordsByDate = generalRecords.reduce((acc, record) => {
    const date = moment(record.createdAt).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = { date, Entradas: 0, Salidas: 0 };
    }
    if (record.type === "in") {
      acc[date].Entradas += 1;
    } else if (record.type === "out") {
      acc[date].Salidas += 1;
    }
    return acc;
  }, {});

  const chartData = Object.values(recordsByDate);

  const dataAssist = [
    {
      name: "Entradas",
      value: generalRecords.filter((record) => record.type === "in").length,
    },
    {
      name: "Salidas",
      value: generalRecords.filter((record) => record.type === "out").length,
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center ">Dashboard</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-blue-950 shadow-lg rounded-lg p-6  flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Resumen General</h2>
            <DonutChart
              data={dataAssist}
              variant="donut"
              onValueChange={(v) => console.log(v)}
            />
            <div className=" flex flex-col justify-around grow gap-5 py-10">
              <div className="flex gap-2 bg-gray-100 p-5 rounded">
                <span className="material-symbols-rounded text-gray-700">
                  meeting_room
                </span>
                <p className="text-gray-700">
                  Total de registros de entradas:{" "}
                  {
                    generalRecords.filter((record) => record.type === "in")
                      .length
                  }
                </p>
              </div>
              <div className="flex gap-2 bg-gray-100 p-5 rounded">
                <span className="material-symbols-rounded text-gray-700">
                  door_front
                </span>
                <p className="text-gray-700">
                  Total de registros de salidas:{" "}
                  {
                    generalRecords.filter((record) => record.type === "out")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-950 shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 ">
              Entradas y Salidas por Puerta
            </h2>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Puerta</th>
                  <th className="px-4 py-2 text-left">Entradas</th>
                  <th className="px-4 py-2 text-left">Salidas</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(7)].map((_, index) => {
                  const gate = index + 1;
                  const entered = generalRecords.filter(
                    (record) => record.gate === gate && record.type === "in"
                  ).length;
                  const exited = generalRecords.filter(
                    (record) => record.gate === gate && record.type === "out"
                  ).length;

                  return (
                    <tr key={index} className="bg-gray-50 hover:bg-gray-100">
                      <td className="border-t px-4 py-2 text-gray-700">
                        Entrada {gate}
                      </td>
                      <td className="border-t px-4 py-2 text-gray-700">
                        {entered}
                      </td>
                      <td className="border-t px-4 py-2 text-gray-700">
                        {exited}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-950 shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Personal de Seguridad
            </h2>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left ">Nombre</th>
                  <th className="px-4 py-2 text-left ">
                    Asistencias registradas
                  </th>
                  <th className="px-4 py-2 text-left ">Puerta Asignada</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((person, index) => (
                  <tr key={index} className="bg-gray-50 hover:bg-gray-100">
                    <td className="border-t px-4 py-2 text-gray-700">
                      {person.firstName}
                    </td>
                    <td className="border-t px-4 py-2 text-gray-700">
                      {
                        generalRecords.filter(
                          (record) => record.staffId === person.id
                        ).length
                      }
                    </td>
                    <td className="border-t px-4 py-2 text-gray-700">
                      Entrada {person.assignedGate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-950 shadow-lg rounded-lg p-6 col-span-3">
            <LineChart
              className="h-80"
              data={chartData}
              index="date"
              categories={["Entradas", "Salidas"]}
              colors={["indigo", "rose"]}
              yAxisWidth={60}
              onValueChange={(v) => console.log(v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
