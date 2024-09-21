        function atualizarDataEHora() {
            const hoje = new Date();

            const dataFormatada = hoje.toISOString().split('T')[0];
            document.getElementById('data').value = dataFormatada;

            const horas = String(hoje.getHours()).padStart(2, '0');
            const minutos = String(hoje.getMinutes()).padStart(2, '0');
            const horarioFormatado = `${horas}:${minutos}`;
            document.getElementById('horario').value = horarioFormatado;
        }

        setInterval(atualizarDataEHora, 1000);

        // Adicionar tarefa
        document.getElementById('add-task').addEventListener('click', async () => {
            const title = document.getElementById('new-task').value;
            const endDate = document.getElementById('task-end-date').value;
            const insertionDate = document.getElementById('data').value;
            const time = document.getElementById('horario').value;

            if (!title || !endDate) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            const response = await fetch('http://localhost:3000/add-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, endDate, insertionDate, time })
            });

            const data = await response.json();
            alert(data.message);

            // Limpar campos
            document.getElementById('new-task').value = '';
            document.getElementById('task-end-date').value = '';

            // Atualizar lista de tarefas
            loadTasks();
        });

        // Carregar tarefas
        async function loadTasks() {
            const response = await fetch('http://localhost:3000/tasks');
            const tasks = await response.json();

            const tbody = document.querySelector('#task-table tbody');
            tbody.innerHTML = '';

            tasks.forEach(task => {
                const tr = document.createElement('tr');
                if (task.completed) {
                    tr.classList.add('completed');
                }

                const tdSelect = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = task._id;
                tdSelect.appendChild(checkbox);

                const tdTitle = document.createElement('td');
                tdTitle.textContent = task.title;

                const tdEndDate = document.createElement('td');
                tdEndDate.textContent = new Date(task.endDate).toLocaleDateString('pt-BR');

                const tdInsertionDate = document.createElement('td');
                tdInsertionDate.textContent = new Date(task.insertionDate).toLocaleDateString('pt-BR');

                const tdTime = document.createElement('td');
                tdTime.textContent = task.time;

                tr.appendChild(tdSelect);
                tr.appendChild(tdTitle);
                tr.appendChild(tdEndDate);
                tr.appendChild(tdInsertionDate);
                tr.appendChild(tdTime);

                tbody.appendChild(tr);
            });
        }

        // Concluir tarefas selecionadas
        document.getElementById('complete-selected').addEventListener('click', async () => {
            const selectedTasks = Array.from(document.querySelectorAll('#task-table tbody input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);

            if (selectedTasks.length === 0) {
                alert('Selecione ao menos uma tarefa.');
                return;
            }

            const response = await fetch('http://localhost:3000/complete-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskIds: selectedTasks })
            });

            const data = await response.json();
            alert(data.message);

            // Atualiza as tarefas
            loadTasks();
        });

        // Excluir tarefas selecionadas
        document.getElementById('delete-selected').addEventListener('click', async () => {
            const selectedTasks = Array.from(document.querySelectorAll('#task-table tbody input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);

            if (selectedTasks.length === 0) {
                alert('Selecione ao menos uma tarefa.');
                return;
            }

            const response = await fetch('http://localhost:3000/delete-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskIds: selectedTasks })
            });

            const data = await response.json();
            alert(data.message);

            // Atualiza as tarefas
            loadTasks();
        });

        // Inicializar
        window.onload = function() {
            atualizarDataEHora();
            loadTasks();
        }
 