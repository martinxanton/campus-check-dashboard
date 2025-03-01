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

  // Agrupamos los registros por fecha
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
    <div className="min-h-screen p-8 bg-gradient-to-r from-gray-900 to-blue-900">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white text-center">Dashboard</h1>
        </header>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tarjeta Resumen General */}
          <div className="bg-gray-800 shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Resumen General</h2>
            <DonutChart
              data={dataAssist}
              variant="donut"
              onValueChange={(v) => console.log(v)}
            />
            <div className="flex flex-col justify-around mt-6 gap-5">
              <div className="flex items-center gap-2 bg-gray-700 p-5 rounded transition hover:bg-gray-600">
                <span className="material-symbols-rounded text-gray-300">meeting_room</span>
                <p className="text-gray-300">
                  Total de registros de entradas:{" "}
                  {generalRecords.filter((record) => record.type === "in").length}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-700 p-5 rounded transition hover:bg-gray-600">
                <span className="material-symbols-rounded text-gray-300">door_front</span>
                <p className="text-gray-300">
                  Total de registros de salidas:{" "}
                  {generalRecords.filter((record) => record.type === "out").length}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Entradas y Salidas por Puerta */}
          <div className="bg-gray-800 shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Entradas y Salidas por Puerta
            </h2>
            <table className="table-auto w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">Puerta</th>
                  <th className="px-4 py-2 text-left text-gray-300">Entradas</th>
                  <th className="px-4 py-2 text-left text-gray-300">Salidas</th>
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
                    <tr
                      key={index}
                      className="transition bg-gray-800 hover:bg-gray-700"
                    >
                      <td className="border-t px-4 py-2 text-gray-300">
                        Entrada {gate}
                      </td>
                      <td className="border-t px-4 py-2 text-gray-300">
                        {entered}
                      </td>
                      <td className="border-t px-4 py-2 text-gray-300">
                        {exited}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjeta Personal de Seguridad */}
          <div className="bg-gray-800 shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Personal de Seguridad
            </h2>
            <table className="table-auto w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">Nombre</th>
                  <th className="px-4 py-2 text-left text-gray-300">
                    Asistencias registradas
                  </th>
                  <th className="px-4 py-2 text-left text-gray-300">Puerta Asignada</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((person, index) => (
                  <tr
                    key={index}
                    className="transition bg-gray-800 hover:bg-gray-700"
                  >
                    <td className="border-t px-4 py-2 text-gray-300">
                      {person.firstName}
                    </td>
                    <td className="border-t px-4 py-2 text-gray-300">
                      {generalRecords.filter(
                        (record) => record.staffId === person.id
                      ).length}
                    </td>
                    <td className="border-t px-4 py-2 text-gray-300">
                      Entrada {person.assignedGate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico de Línea */}
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mt-8">
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
  );
}

export default Dashboard;
