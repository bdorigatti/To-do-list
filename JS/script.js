// ======================================================
// ELEMENTOS DO HTML
// ======================================================
 
const taskForm = document.querySelector(".task-form");
const taskInput = document.querySelector("#new-task");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
 
const filterButtons = document.querySelectorAll(".filter-button");
 
 
// ======================================================
// ARMAZENAMENTO (localStorage)
// ======================================================
 
const STORAGE_KEY = "todo-tasks";
const FILTER_STORAGE_KEY = "todo-filter";
 
function saveTasks() {
 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
 
}
 
function loadTasks() {
 
    const saved = localStorage.getItem(STORAGE_KEY);
 
    if (!saved) {
 
        return [];
 
    }
 
    try {
 
        const parsed = JSON.parse(saved);
 
        // Converte createdAt (string) de volta para Date
        return parsed.map(function (task) {
 
            return {
                ...task,
                createdAt: new Date(task.createdAt)
            };
 
        });
 
    } catch (error) {
 
        console.error("Erro ao carregar tarefas salvas:", error);
 
        return [];
 
    }
 
}
 
function saveFilter() {
 
    localStorage.setItem(FILTER_STORAGE_KEY, currentFilter);
 
}
 
function loadFilter() {
 
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
 
    return saved || "all";
 
}
 
 
// ======================================================
// VARIÁVEIS
// ======================================================
 
let tasks = loadTasks();
 
let currentFilter = loadFilter();
 
// Guarda o id da tarefa recém-criada, só para tocar a animação nela
let lastAddedId = null;
 
 
// ======================================================
// ADICIONAR TAREFA
// ======================================================
 
taskForm.addEventListener("submit", function (event) {
 
    event.preventDefault();
 
 
    const taskText = taskInput.value.trim();
 
 
    // Não permite tarefa vazia
    if (taskText === "") {
 
        return;
 
    }
 
 
    // Pega a data e hora exatas da criação
    const createdAt = new Date();
 
 
    // Cria a tarefa
    const task = {
 
        id: Date.now(),
 
        text: taskText,
 
        completed: false,
 
        createdAt: createdAt
 
    };
 
 
    // Adiciona a tarefa
    tasks.push(task);
 
    lastAddedId = task.id;
 
 
    // Salva no localStorage
    saveTasks();
 
 
    // Limpa o campo
    taskInput.value = "";
 
 
    // Atualiza a lista
    renderTasks();
 
 
    // Volta o cursor para o campo
    taskInput.focus();
 
});
 
 
// ======================================================
// FORMATAR DATA E HORA DA TAREFA
// ======================================================
 
function formatTaskDate(date) {
 
    const formattedDate = date.toLocaleDateString("pt-BR");
 
    const formattedTime = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
 
 
    return `Incluída em: ${formattedDate} às ${formattedTime}`;
 
}
 
 
// ======================================================
// MENSAGEM DE LISTA VAZIA
// ======================================================
 
function getEmptyMessage() {
 
    if (currentFilter === "pending") {
 
        return "Nenhuma tarefa pendente. 🎉";
 
    }
 
    if (currentFilter === "completed") {
 
        return "Nenhuma tarefa concluída ainda.";
 
    }
 
    return "Nenhuma tarefa por aqui. Adicione a primeira acima!";
 
}
 
 
// ======================================================
// EXIBIR TAREFAS
// ======================================================
 
function renderTasks() {
 
    taskList.innerHTML = "";
 
 
    // Filtra as tarefas
    const filteredTasks = tasks.filter(function (task) {
 
        if (currentFilter === "pending") {
 
            return !task.completed;
 
        }
 
 
        if (currentFilter === "completed") {
 
            return task.completed;
 
        }
 
 
        return true;
 
    });
 
 
    // Lista vazia (geral ou por causa do filtro)
    if (filteredTasks.length === 0) {
 
        const emptyState = document.createElement("li");
 
        emptyState.classList.add("empty-state");
 
        emptyState.textContent = getEmptyMessage();
 
        taskList.appendChild(emptyState);
 
        updateTaskCount();
 
        return;
 
    }
 
 
    // Cria cada tarefa
    filteredTasks.forEach(function (task) {
 
 
        // ==================================================
        // ITEM DA TAREFA
        // ==================================================
 
        const li = document.createElement("li");
 
        li.classList.add("task-item");
 
 
        if (task.completed) {
 
            li.classList.add("completed");
 
        }
 
 
        // Toca a animação de entrada só na tarefa recém-criada
        if (task.id === lastAddedId) {
 
            li.classList.add("task-item-new");
 
        }
 
 
        // ==================================================
        // BOTÃO CONCLUIR
        // ==================================================
 
        const checkButton = document.createElement("button");
 
        checkButton.classList.add("check-button");
 
        checkButton.type = "button";
 
        checkButton.setAttribute(
            "aria-label",
            "Marcar tarefa como concluída"
        );
 
 
        if (task.completed) {
 
            checkButton.textContent = "✓";
 
        }
 
 
        checkButton.addEventListener("click", function () {
 
            task.completed = !task.completed;
 
            saveTasks();
 
            renderTasks();
 
        });
 
 
        // ==================================================
        // CONTAINER DO TEXTO
        // ==================================================
 
        const taskContent = document.createElement("div");
 
        taskContent.classList.add("task-content");
 
 
        // Texto da tarefa
        const taskText = document.createElement("span");
 
        taskText.classList.add("task-text");
 
        taskText.textContent = task.text;
 
        taskText.title = "Dê um duplo clique para editar";
 
 
        // Ativa modo de edição com duplo clique
        taskText.addEventListener("dblclick", function () {
 
            startEditingTask(task, taskText);
 
        });
 
 
        // Data e hora
        const taskDate = document.createElement("small");
 
        taskDate.classList.add("task-date");
 
 
        // Garante que a data seja um objeto Date
        const date = task.createdAt instanceof Date
            ? task.createdAt
            : new Date(task.createdAt);
 
 
        taskDate.textContent = formatTaskDate(date);
 
 
        // Adiciona texto + data no container
        taskContent.appendChild(taskText);
 
        taskContent.appendChild(taskDate);
 
 
        // ==================================================
        // BOTÃO EXCLUIR
        // ==================================================
 
        const deleteButton = document.createElement("button");
 
        deleteButton.classList.add("delete-button");
 
        deleteButton.type = "button";
 
        deleteButton.textContent = "×";
 
        deleteButton.setAttribute(
            "aria-label",
            "Excluir tarefa"
        );
 
 
        deleteButton.addEventListener("click", function () {
 
            const confirmed = window.confirm(
                `Excluir a tarefa "${task.text}"?`
            );
 
            if (!confirmed) {
 
                return;
 
            }
 
            tasks = tasks.filter(function (item) {
 
                return item.id !== task.id;
 
            });
 
 
            saveTasks();
 
            renderTasks();
 
        });
 
 
        // ==================================================
        // MONTA A TAREFA
        // ==================================================
 
        li.appendChild(checkButton);
 
        li.appendChild(taskContent);
 
        li.appendChild(deleteButton);
 
 
        taskList.appendChild(li);
 
    });
 
 
    // A animação já tocou, não precisa mais marcar essa tarefa
    lastAddedId = null;
 
 
    // Atualiza contador
    updateTaskCount();
 
}
 
 
// ======================================================
// EDITAR TAREFA (duplo clique)
// ======================================================
 
function startEditingTask(task, taskTextElement) {
 
    const input = document.createElement("input");
 
    input.type = "text";
 
    input.classList.add("task-edit-input");
 
    input.value = task.text;
 
 
    taskTextElement.replaceWith(input);
 
    input.focus();
 
    input.select();
 
 
    function saveEdit() {
 
        const newText = input.value.trim();
 
 
        // Se apagar tudo, mantém o texto original em vez de salvar vazio
        if (newText !== "") {
 
            task.text = newText;
 
            saveTasks();
 
        }
 
 
        renderTasks();
 
    }
 
 
    input.addEventListener("keydown", function (event) {
 
        if (event.key === "Enter") {
 
            input.blur();
 
        }
 
 
        if (event.key === "Escape") {
 
            input.removeEventListener("blur", saveEdit);
 
            renderTasks();
 
        }
 
    });
 
 
    input.addEventListener("blur", saveEdit);
 
}
 
 
// ======================================================
// CONTADOR
// ======================================================
 
function updateTaskCount() {
 
    const total = tasks.length;
 
 
    if (total === 1) {
 
        taskCount.textContent = "1 tarefa";
 
    } else {
 
        taskCount.textContent = `${total} tarefas`;
 
    }
 
}
 
 
// ======================================================
// FILTROS
// ======================================================
 
filterButtons.forEach(function (button) {
 
    // Aplica visualmente o filtro salvo ao carregar a página
    if (button.dataset.filter === currentFilter) {
 
        filterButtons.forEach(function (btn) {
 
            btn.classList.remove("active");
 
        });
 
        button.classList.add("active");
 
    }
 
 
    button.addEventListener("click", function () {
 
 
        filterButtons.forEach(function (btn) {
 
            btn.classList.remove("active");
 
        });
 
 
        button.classList.add("active");
 
 
        currentFilter = button.dataset.filter;
 
        saveFilter();
 
 
        renderTasks();
 
    });
 
});
 
// INICIALIZAÇÃO
renderTasks();