export default function TaskCard({ task }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col cursor-pointer">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
            ${task.reward.toFixed(2)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{task.time} • {task.completed.toLocaleString()} completed</p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sm text-gray-500">
            <i className="fas fa-user-check mr-1"></i> 98% approval
          </span>
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded transition">
            Start Task
          </span>
        </div>
      </div>
    </div>
  )
}